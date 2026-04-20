
SEND_TIME = time(15, 30)
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

        candidatos = []
        for t in turnos:
            fecha = t['fecha']
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
            print("No se obtuvieron resultados desde Informix.")
            return

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
                print(f"[WARN] Tuple inválida: {ex}")
                continue

            t_local = turnos_map.get(id_turno)
            if not t_local:
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

            target_date = fecha_turno - timedelta(days=dias_antes)

            base_naive = datetime.combine(target_date, SEND_TIME)
            try:
                send_dt = make_aware(base_naive, tz)
            except Exception:
                send_dt = base_naive.replace(tzinfo=tz)

            send_dt = ajustar_horario_envio(send_dt)

            now = timezone.now()
            eta = send_dt if send_dt > now else now + timedelta(seconds=5)

            try:
                args = list(map(str, r))
                args.append(str(id))
                send_reminder_task.apply_async(args=args, eta=eta)
                print(f"Programado turno {id_turno} en {eta}")
            except Exception as ex:
                print(f"[ERROR] programando {id_turno}: {ex}")

        print("Procesamiento completo")

    except Exception as e:
        print(f"Error en recordatorios: {e}")


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
    try:
        tz = timezone.get_current_timezone()

        with transaction.atomic():
            turno = Turno.objects.select_for_update().get(id=id)

            if turno.id_estado_id != 1 or turno.msj_recordatorio == 1:
                return

            send_flag, plantilla = check_turno(id_efe_ser_esp, 4)
            if not send_flag or not plantilla:
                return

            if Mensaje.objects.filter(id_turno=id, id_plantilla__id_tipo__id=4).exists():
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
        print(f"[ERROR] send_reminder_task {id_turno}: {e}")