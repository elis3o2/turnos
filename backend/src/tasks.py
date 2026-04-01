import pytz
from zoneinfo import ZoneInfo
from collections import defaultdict
from datetime import timedelta, datetime, date, time
from django.utils.timezone import make_aware
from celery import shared_task
from django.conf import settings
from django.db import connections, transaction, connection as default_connection
from django.db.models import OuterRef, Subquery, Exists, IntegerField, Max
from django.utils import timezone
from src.models import (Turno, Plantilla, Mensaje, LastMod,
                        EfeSerEspPlantilla, EstadoTurno, Efector, Servicio,
                        Especialidad, EfeSerEsp, Flow, TurnoFlow, PlantillaFlow)
from src.utils.utils import enviar_whatsapp2, check_turno, format_plantilla, start_flow
import random
from src.utils.querys_informix import query_detalles_turno, query_efector, query_persona, query_turnos_historico
from src.utils.parse import parse_date, parse_time
from src.utils.utils import create_Turno, update_estado_Turno, create_Mensaje, map_estdo, decode_res2, sacar_Turno_Espera, create_flow, get_session
from rest_framework.response import Response

TZ = ZoneInfo("America/Argentina/Buenos_Aires")


@shared_task
def verificar_turnos() -> None:
    print(f"[{timezone.now()}] Ejecutando verificación de turnos...")
    
    # Obtener/crear LastMod 
    try:
        last_mod_obj = LastMod.objects.first()
        if last_mod_obj: 
            last_mod_raw = last_mod_obj.fecha
        else:
            return
    except Exception as e:
        print(f"[ERROR] al obtener/crear LastMod: {e}")
        return

    try:
        conn = connections['informix']
        with conn.cursor() as cur:
            lm_param = last_mod_raw.strftime("%Y-%m-%d %H:%M:%S")
            print(f"[DEBUG] Usando last_mod para consulta Informix: {lm_param!r}")

            try:
                cur.execute(query_turnos_historico(), [lm_param])
           
            except Exception as ex:
                print(f"[ERROR] al ejecutar consulta de notificaciones con param {lm_param!r}: {ex}")
                return

            mejor_raw = None

            for r in cur.fetchall():
                print(f"[DEBUG] notificacion raw: {r}")
                idturno, idpaciente, idestadoturno, last_modf_val = r

                este_raw = str(last_modf_val).split(".")[0]
                if mejor_raw is None or este_raw > mejor_raw:
                    mejor_raw = este_raw

                # Mapeo de idestadoturno -> estado (restaurado al mapping esperado)
                estado = map_estdo(idestadoturno)

                # Inicializo variables que luego uso (mínimo)
                id_efe_ser_esp = None
                id_efector = id_servicio = id_especialidad = None
                nombre_servicio = nombre_especialidad = nombre_efector = None
                calle = altura = letra = coordx = coordy = tel_efe = calle_nom = None
                carac_tel = tel = nom_pac = ape_pac = nom_prof = ape_prof = None
                d_fecha = d_hora = None

                # Si corresponde (0 o 3) traigo detalles completos
                detalles = None
                if estado in (1, 3):
                    try:
                        cur.execute(query_detalles_turno(1), [idturno])
                        detalles = cur.fetchone()
                    
                    except Exception as ex:
                        print(f"[ERROR] al ejecutar make_query() para idturno={idturno}: {ex}")
                        continue

                    if not detalles:
                        print(f"[DEBUG] No hay detalles para idturno={idturno}")
                        continue

                    (
                        _id_from_row, id_efector, id_servicio, id_especialidad, id_efe_ser_esp ,
                        tipo_doc, nro_doc, ape_pac, nom_pac, fecha_turno, hora_turno,
                        ape_prof, nom_prof, nombre_servicio, nombre_especialidad,
                        nombre_efector, calle, altura, letra, coordx, coordy,
                        tel_efe, calle_nom, carac_tel, tel
                    ) = detalles
                    # parsear
                    d_fecha = parse_date(fecha_turno)
                    d_hora = parse_time(hora_turno)
                    fecha = d_fecha.strftime("%d-%m-%Y")
                    hora = d_hora.strftime("%H:%M")

                    if estado == 1:
                        try:
                            t = create_Turno(idturno, idpaciente,estado,
                                id_efe_ser_esp, d_fecha, d_hora)
                            
                            print(f"[INFO] Creado Turno id={idturno} fecha={fecha} hora={hora}")

                            # b = sacar_Turno_Espera(idpaciente, id_efe_ser_esp)
                            # if b:
                            #     print(f"[INFO] Turno en Lista de Espera asignado idpaciente={idpaciente}")

                        except Exception as ex:
                            print(f"[ERROR] al crear Turno id={idturno}: {ex}")
                            continue

                if estado in (2, 3, 4):
                    t = update_estado_Turno(idturno, idpaciente, estado)
                    
                    if t == None:
                        continue
                    # Si estado == 2 (suspendido) 
                    if estado == 2:
                            
                        try:
                            # obtener datos persona de forma segura
                            cur.execute(query_persona(), [idpaciente])
                            persona_row = cur.fetchone()
                            if persona_row:
                                ape_pac, nom_pac, carac_tel, tel = persona_row
                            else:
                                ape_pac = nom_pac = carac_tel = tel = None

                            # --- cambio mínimo: obtener id_efe_ser_esp desde Turno si no lo tenemos
                            id_efe_ser_esp = getattr(t, "id_efe_ser_esp_id", id_efe_ser_esp)

                            # obtener EfeSerEsp para sacar efector / servicio / especialidad
                            ese_obj = (
                                EfeSerEsp.objects
                                .select_related(
                                    "id_efector",
                                    "id_ser_esp__id_servicio",
                                    "id_ser_esp__id_especialidad",
                                )
                                .get(pk=id_efe_ser_esp)
                            )

                            # IDs reales
                            id_efector = ese_obj.id_efector_id
                            id_servicio = ese_obj.id_ser_esp.id_servicio_id
                            id_especialidad = ese_obj.id_ser_esp.id_especialidad_id

                            # Valores reales (nombre)
                            nombre_efector = ese_obj.id_efector.nombre
                            nombre_servicio = ese_obj.id_ser_esp.id_servicio.nombre
                            nombre_especialidad = ese_obj.id_ser_esp.id_especialidad.nombre

                            # datos del efector vía cursor Informix
                            nombre_efector = calle = altura = letra = coordx = coordy = tel_efe = calle_nom = None
                            
                            cur.execute(query_efector(), [id_efector])
                            ef_row = cur.fetchone()
                            if ef_row:
                                (nombre_efector, calle, altura, letra,
                                coordx, coordy, tel_efe, calle_nom) = ef_row

                            # obtener fecha/hora guardadas en Turno (siempre strings según create)
                            d_fecha = getattr(t, "fecha", None)
                            d_hora = getattr(t, "hora", None)

                            # intentar parsear sin hacer chequeos extra (cambio mínimo)

                            fecha = parse_date(d_fecha).strftime("%d-%m-%Y")
                            
                            hora = parse_time(d_hora).strftime("%H:%M")


                            nom_prof = None
                            ape_prof = None
                        except Exception as ex:
                            print(f"[ERROR] al procesar estado 2 para idturno={idturno}: {ex}")
                            continue

                if estado == 4:
                    continue

                telefono = None
                send, plantilla = check_turno(id_efe_ser_esp, estado)
                if send and plantilla:
                    if carac_tel and tel:
                        telefono = ("549" + str(carac_tel) + str(tel)).replace(" ", "")

                        datos_plantilla = {
                            "nompac": nom_pac or "",
                            "apepac": ape_pac or "",
                            "fecha": fecha,
                            "horaturno": hora,
                            "nomprof": nom_prof or "",
                            "apeprof": ape_prof or "",
                            "especialidad": nombre_especialidad or "",
                            "efector": nombre_efector or "",
                            "servicio": nombre_servicio or "",
                            "calle": calle or "",
                            "altura": altura or "",
                            "letra": letra or "",
                            "coordx": coordx or "",
                            "coordy": coordy or "",
                            "tel_efe": tel_efe or "",
                            "calle_nom": calle_nom or "",
                        }

                        mensaje = format_plantilla(plantilla.contenido, datos_plantilla)
                        res = enviar_whatsapp2(telefono, mensaje)
                        try:                            
                            (envio_id, ack, fecha, ins) = decode_res2(res)

                            create_Mensaje(id=envio_id, turno=t, numero=telefono, plantilla=plantilla, estado=ack, fecha=fecha, sesion=ins)

                        except Exception as ex:
                            print(f"[ERROR] al crear Mensaje para turno {idturno}: {ex}")
                            continue

                    else:
                        ack =-3
                        try:
                            create_Mensaje(turno=t, plantilla=plantilla, numero=telefono ,estado=ack)
                        except Exception as ex:
                            print(f"[ERROR] al crear Mensaje para turno {idturno}: {ex}")

                    if ack >= 0:  # actualizar flags en Turno
                        try:
                            if estado == 1:
                                t.msj_confirmado = 1
                                t.save(update_fields=["msj_confirmado"])
                            elif estado == 2:
                                t.msj_cancelado = 1
                                t.save(update_fields=["msj_cancelado"])
                            elif estado == 3:
                                t.msj_reprogramado = 1
                                t.save(update_fields=["msj_reprogramado"])
                        except Exception as ex:
                            print(f"[ERROR] al actualizar flags msj_* en Turno id={idturno}: {ex}")
                
            # Al final: actualizar LastMod con mejor_raw EXACTO (SQL directo en default_connection)
            try:
                if mejor_raw is None:
                    print("[DEBUG] No se encontró mejor_raw -> no se actualiza LastMod")
                else:
                    
                    last_mod_obj.fecha = mejor_raw
                    last_mod_obj.save(update_fields=['fecha'])

                    print(f"[DEBUG] Actualizado LastMod.fecha = {last_mod_obj.fecha}")
            except Exception as ex:
                print(f"[ERROR] al actualizar LastMod con SQL directo: {ex}")

    except Exception as e:
        print(f"[ERROR] Error en verificación de turnos: {e}")



SEND_TIME = time(10, 30)
BATCH_SIZE = 5
BATCH_WINDOW_SECONDS = 720
@shared_task
def programar_recordatorios() -> None:
    print(f"[{timezone.now().isoformat()}] Ejecutando recordatorios...")

    try:
        hoy = datetime.now().date()

        efp_qs = (
            EfeSerEspPlantilla.objects
            .filter(
                id_efe_ser_esp=OuterRef('id_efe_ser_esp'),
                recordatorio=1
            )
        )

        rango_fin = hoy + timedelta(days=5)

        turnos_qs = (
            Turno.objects
            .filter(id_estado=1, msj_recordatorio=0, fecha__range=(hoy, rango_fin))
            .annotate(
                efp_exists=Exists(efp_qs),
                plantilla_reco=Subquery(efp_qs.values('plantilla_reco')[:1]),
                dias_antes=Subquery(efp_qs.values('dias_antes')[:1]),
            )
            .filter(efp_exists=True)
            .order_by('fecha', 'hora')
            .values(
                'id', 'id_sisr', 'id_efe_ser_esp',
                'fecha', 'hora', 'dias_antes', 'plantilla_reco'
            )
        )

        turnos = list(turnos_qs)
        if not turnos:
            print("No hay turnos candidatos para recordatorios.")
            return

        # Filtrar los que realmente correspondan: fecha - dias_antes == hoy
        candidatos = []
        for t in turnos:
            fecha: date = t['fecha']
            dias_antes = int(t['dias_antes'] or 0)
            if fecha - timedelta(days=dias_antes) == hoy:
                candidatos.append(t)

        if not candidatos:
            print("Ningún turno requiere recordatorio hoy.")
            return

        turnos_ids = [t['id_sisr'] for t in candidatos]
        turnos_map = {t["id_sisr"]: t for t in candidatos}

        conn = connections['informix']
        resultados = []
        if turnos_ids:
            with conn.cursor() as cur:
                cur.execute(query_detalles_turno(len(turnos_ids)), turnos_ids)
                resultados = cur.fetchall()

        if not resultados:
            print("No se obtuvieron resultados desde Informix para los turnos solicitados.")
            return

        # distribuimos envíos para turnos en días futuros: evitar picos
        per_day_counter = defaultdict(int)
        per_day_batches = {}  # nuevo: guarda offsets por (target_date, batch_index)
        tz = timezone.get_current_timezone()

        for r in resultados:
            try:
                (
                    id_turno, id_efector, id_servicio, id_especialidad,
                    id_efe_ser_esp, tipo_doc, nro_doc,
                    ape_pac, nom_pac, fecha_turno_inf, hora_turno_inf,
                    ape_prof, nom_prof, nombre_servicio, nombre_especialidad,
                    nombre_efector, calle, altura, letra, coordx, coordy,
                    tel_efe, calle_nom, carac_tel, tel
                ) = r
            except Exception as ex:
                print(f"[WARN] Tuple de resultados con longitud inesperada: {ex} -> {r}")
                continue

            t_local = turnos_map.get(id_turno)
            if not t_local:
                print(f"[WARN] No se encontró turno local para id_turno={id_turno}")
                continue

            telefono = normalizar_telefono(carac_tel, tel)
            if not telefono:
                print(f"[DEBUG] Teléfono inválido para turno {id_turno}")

                try:
                    turno_obj = Turno.objects.get(id=t_local["id"])
                    send_flag, plantilla = check_turno(id_efe_ser_esp, 4)
                    if plantilla:
                        create_Mensaje(turno=turno_obj, plantilla=plantilla, estado=-3)
                except Exception as ex:
                    print(f"[ERROR] creando mensaje inválido {id_turno}: {ex}")

                continue

            fecha_turno = t_local["fecha"]
            dias_antes = int(t_local.get("dias_antes") or 0)
            id = t_local["id"]

            # fecha objetivo para el envío (la que determinó el candidato)
            target_date = fecha_turno - timedelta(days=dias_antes)

            base_naive = datetime.combine(target_date, SEND_TIME)
            try:
                send_dt = make_aware(base_naive, tz)
            except Exception:
                send_dt = base_naive.replace(tzinfo=tz)

            send_dt = ajustar_horario_envio(send_dt)

            now = timezone.now()
            if getattr(now, "tzinfo", None) is None:
                try:
                    now = make_aware(now, tz)
                except Exception:
                    pass

            if send_dt <= now:
                eta = now + timedelta(seconds=5)
            else:
                eta = send_dt
            try:
                args = list(map(str, r))
                args.append(str(id))
                send_reminder_task.apply_async(args=args, eta=eta)
                print(f"Programado reminder para id_turno={id_turno} en {eta.isoformat()}")
            except Exception as ex:
                print(f"[ERROR] al programar send_reminder_task para id_turno={id_turno}: {ex}")

        print("Procesamiento de recordatorios completado")

    except Exception as e:
        print(f"Error en recordatorios: {str(e)}")


@shared_task(bind=True, max_retries=100)
def send_reminder_task(
    self,
    id_turno,
    id_efector, id_servicio, id_especialidad,
    id_efe_ser_esp, tipo_doc, nro_doc,
    ape_pac, nom_pac, fecha_turno, hora_turno,
    ape_prof, nom_prof, nombre_servicio, nombre_especialidad,
    nombre_efector, calle, altura, letra, coordx, coordy,
    tel_efe, calle_nom, carac_tel, tel, id
):
    # seguridad: inicializar ack
    ack = None

    need_retry = False  # bandera para reintentar después del commit

    try:
        with transaction.atomic():
            # 🔒 LOCK del turno (FOR UPDATE)
            turno = (
                Turno.objects
                .select_for_update()
                .get(id=id)
            )

            if not turno:
                print(f"[WARN] Turno {id_turno} no existe.")
                return

            # Si el turno cambió de estado o ya tiene recordatorio, no enviamos
            if turno.id_estado_id != 1 or turno.msj_recordatorio == 1:
                print(f"Cambio de estado o ya enviado para turno {id_turno}, abortando envío.")
                return

            # comprobar si aún corresponde (ej: chequeos de configuración dinámica)
            send_flag, plantilla = check_turno(id_efe_ser_esp, 4)
            if not send_flag or not plantilla:
                print(f"[DEBUG] check_turno returned send={send_flag}, plantilla={plantilla} for turno {id_turno}")
                return

            if Mensaje.objects.filter(id_turno=id, id_plantilla__id_tipo__id=4).exists():
                print(f"[DEBUG] ya se intento enviar el mensaje, abortando")
                return

            telefono = normalizar_telefono(carac_tel, tel)
            if not telefono:
                return

            d_fecha = parse_date(fecha_turno)
            d_hora = parse_time(hora_turno)
            turno_dt = make_aware(datetime.combine(d_fecha, d_hora), tz)

            now = timezone.now()

            if now >= turno_dt:
                print(f"[INFO] Turno vencido {id_turno}")
                return

            if Flow.objects.filter(numero=telefono, id_estado_id=0).exists():
                eta = calcular_proximo_retry(now)
                if eta < turno_dt:
                    raise self.retry(eta=eta)
                return

            datos_plantilla = {
                "nompac": nom_pac or "",
                "apepac": ape_pac or "",
                "fecha": d_fecha.strftime("%d-%m-%Y"),
                "horaturno": d_hora.strftime("%H:%M"),
                "nomprof": nom_prof or "",
                "apeprof": ape_prof or "",
                "especialidad": nombre_especialidad or "",
                "efector": nombre_efector or "",
            }

            mensaje = format_plantilla(plantilla.contenido, datos_plantilla)

            res = enviar_whatsapp2(telefono, mensaje)
            (envio_id, ack, fecha, ins) = decode_res2(res)

            create_Mensaje(
                id=envio_id,
                turno=turno,
                numero=telefono,
                plantilla=plantilla,
                estado=ack,
                fecha=fecha,
                sesion=ins
            )

            if ack >= 0:
                turno.msj_recordatorio = 1
                turno.save(update_fields=["msj_recordatorio"])

        # if ack >= 0 and not need_retry:
            # create_flow(telefono, turno)

        # si marcamos reintento, lo hacemos **fuera** del atomic y usando el mecanismo de Celery
        if need_retry:
            try:
                # self.retry lanzará una excepción especial que marca el task como reintentado
                raise self.retry(exc=Exception("Flow activo, reintentando más tarde"))
            except self.MaxRetriesExceededError:
                print(f"[WARN] Max retries excedidos para turno {id_turno}. No se enviará recordatorio.")
                return

            if ack == -5:
                eta = calcular_proximo_retry(now)
                if eta < turno_dt:
                    print(f"[RETRY] turno {id_turno} en {eta}")
                    raise self.retry(eta=eta)
                print(f"[STOP] se alcanzó la fecha/hora del turno {id_turno}")
                return

            return

    except self.MaxRetriesExceededError:
        print(f"[WARN] Max retries alcanzado {id_turno}")

    except Exception as e:
        print(f"[ERROR general en send_reminder_task para id_turno={id_turno}]: {e}")