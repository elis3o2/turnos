from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from decouple import config
from django.db.models import Count, Sum,  Q, Subquery, OuterRef
from django.db.models.functions import Coalesce
from django.conf import settings
from django.db import connections, DatabaseError
from django.core.cache import cache
from collections import OrderedDict
from src.models import (Plantilla,  EstadoMsj, EstadoTurno, Turno, TurnoEspera, Deriva,
                        Mensaje, Efector,Servicio, Especialidad, EfeSerEspPlantilla,
                        EfeSerEsp, EstudioRequerido, Flow, TurnoFlow, TurnoEsperaEstudio)
from src.serializers import(PlantillaSerializer, EstadoMsjSerializer, EstadoTurnoSerializer,
                TurnoSerializer, TurnoEsperaSerializer, MensajeSerializer, DerivaSerializer,
                EfectorSerializer, ServicioSerializer,EspecialidadSerializer, EfeSerEspPlantillaSerializer, EfeSerEspPlantillaDetailSerializer,
                CustomTokenObtainPairSerializer,  TurnoMergedSerializer, HistoricoPacienteSerializer, 
                PacienteSerializer, ProfesionalSerializer, EfeSerEspSerializer, EfeSerEspEfectorSerializer,
                EfeSerEspCompletoSerializer, TurnoEsperaCreateSerializer, TurnoEsperaCloseSerializer,
                EstudioRequeridoSerializer )
from django.utils import timezone
from typing import List
from src.utils.utils import enviar_whatsapp, fetch_paciente, fetch_profesional
from src.utils.querys_informix import query_turno_historico_paciente, query_turnos, query_eliminado
import logging
logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class SendWSP(APIView):
    def post(self, request, *args, **kwargs):
        # Obtener parámetros del cuerpo de la solicitud
        numero = request.data.get('numero')
        msj = request.data.get('mensaje')

        # Validar que existan ambos parámetros
        if not numero or not msj:
            return Response(
                {'error': 'Se requieren numero y mensaje en el cuerpo de la solicitud'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return enviar_whatsapp(numero, msj)





# ---------- API para búsquedas NO por id (retorna listas) ----------
class GetPacienteAPIView(APIView):
    """
    GET /api/pacientes/?dni=...&nombre=...&apellido=...
    Si se pasa 'id' devuelve solo un objeto (como mejora; pero preferimos usar GetPacienteDetail para id).
    Aquí se usa para búsquedas por filtros (no-id).
    """
    def get(self, request) -> Response:
        id_persona = request.query_params.get('id')
        dni = request.query_params.get('dni')


        try:
            if id_persona:
                # si se pasa id devolvemos UN solo objeto
                paciente = fetch_paciente(id_persona=int(id_persona))
                if not paciente:
                    return Response({}, status=status.HTTP_404_NOT_FOUND)
                ser = PacienteSerializer(instance=paciente)
                return Response(ser.data, status=status.HTTP_200_OK)

            # búsqueda por filtros (al menos uno requerido)
            if not (dni):
                return Response({"detail": "Al menos uno de los parámetros (dni, nombre, apellido) es requerido para la búsqueda."},
                                status=status.HTTP_400_BAD_REQUEST)

            pacientes = fetch_paciente(dni=dni)
            ser = PacienteSerializer(instance=pacientes, many=True)
            return Response(ser.data, status=status.HTTP_200_OK)

        except DatabaseError:
            logger.exception("Error consultando pacientes")
            return Response({"detail": "Error al consultar la base de datos."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception:
            logger.exception("Error inesperado en GetPacienteAPIView")
            return Response({"detail": "Error interno."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetProfesionalAPIView(APIView):
    """
    GET /api/profesionales/?id=...  OR ?id_efe=...&nombre=...&apellido=...
    Si se pasa id devuelve un único profesional; si no, devuelve todos los que coincidan con id_efe y filtros.
    """
    def get(self, request) -> Response:
        try:
            id_prof: str | None = request.query_params.get('id')
            id_efector: str | None = request.query_params.get('id_efector')
            nombre: str | None = request.query_params.get('nombre')
            apellido = request.query_params.get('apellido')

            if id_prof:
                prof = fetch_profesional(id_prof=int(id_prof))
                if not prof:
                    return Response({}, status=status.HTTP_404_NOT_FOUND)
                ser = ProfesionalSerializer(instance=prof)
                return Response(ser.data, status=status.HTTP_200_OK)

            # búsqueda por efector (requerido si no hay id)
            if not id_efector:
                return Response({"detail": "Parámetro 'id_efe' requerido para búsqueda sin id."},
                                status=status.HTTP_400_BAD_REQUEST)

            profs = fetch_profesional(id_efector=int(id_efector), nombre=nombre, apellido=apellido)
            ser = ProfesionalSerializer(instance=profs, many=True)
            return Response(ser.data, status=status.HTTP_200_OK)

        except DatabaseError:
            logger.exception("Error consultando profesionales")
            return Response({"detail": "Error al consultar la base de datos."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception:
            logger.exception("Error inesperado en GetProfesionalAPIView")
            return Response({"detail": "Error interno."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class HistoricoPaciente(APIView):
    def get(self, request) -> Response:
        id = request.query_params.get('id')
        if not id:
            return Response({"detail": "Parámetro 'id' requerido."}, status=status.HTTP_400_BAD_REQUEST)


        try:
            with connections['informix'].cursor() as cur:
                cur.execute(query_turno_historico_paciente(), (id, id))
                rows = cur.fetchall()

                # Si no hay filas, devolvemos array vacío (evitamos operar sobre cur.description None)
                if not rows:
                    return Response([], status=status.HTTP_200_OK)

                # cur.description puede tener varias formas según el driver.
                # Hacemos una extracción tolerante a formatos:
                cols = []
                desc = cur.description
                if desc:
                    for c in desc:
                        name_py = str(c[0])
                        cols.append(name_py.lower())

        except DatabaseError:
            logger.exception("Error consultando Informix")
            return Response({"detail": "Error al consultar la base de datos Informix."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception:
            logger.exception("Error inesperado")
            return Response({"detail": "Error interno."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Convertir a lista de dicts manteniendo objetos datetime (para que DRF los serialice correctamente).
        result = []
        for r in rows:
            item = {}
            for i, v in enumerate(r):
                col = cols[i]
                item[col] = v
            result.append(item)

        # Serializamos para normalizar salida y que DRF formatee fechas automáticamente
        serializer = HistoricoPacienteSerializer(instance=result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class GetIncorrectoAPIView(APIView):

    def get(self, request) -> Response:
        cantidad = int(request.query_params.get('cantidad'))  # nuevo: cantidad a devolver
        efectores_param = request.query_params.getlist('efectores[]')
        servicios_param = request.query_params.getlist('servicios[]')
        offset = int(request.query_params.get('offset'))
        fecha_desde = request.query_params.get('fechaDesde')
        fecha_hasta = request.query_params.get('fechaHasta')

        id_efectores = [int(p.strip()) for p in efectores_param]
        id_servicios = [int(p.strip()) for p in servicios_param]

        if len(id_efectores) == 0:
            return Response(
                {"detail": "Debe proveer 'efector'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        filters = {'id_efe_ser_esp__id_efector__in': id_efectores}
        if len(id_servicios) > 0:
            filters['id_efe_ser_esp__id_ser_esp__id_servicio__in'] = id_servicios
        if fecha_desde:
            filters['fecha__gte'] = fecha_desde
        if fecha_hasta:
            filters['fecha__lte'] = fecha_hasta

        try:
            latest_msg_qs = Mensaje.objects.filter(id_turno=OuterRef('pk')).order_by('-fecha_envio')

            qs = (
                Turno.objects
                .select_related("id_efe_ser_esp")
                .annotate(
                    latest_msg_estado=Subquery(latest_msg_qs.values('id_estado')[:1]),
                )
                .filter(
                    Q(latest_msg_estado__lt=0),
                    **filters
                )
                .order_by('-fecha', '-hora', '-id')
            )


            # calcular total antes del slicing (útil para paginación)
            total = qs.count()

            # aplicar offset y cantidad
            start = offset
            end = None if cantidad is None else (offset + cantidad)
            local_qs = qs[start:end]
            local_list = list(local_qs)

            if not local_list:
                return Response({"response": [], "count": 0}, status=status.HTTP_200_OK)

        except Exception:
            logger.exception("Error al obtener turnos locales (GetIncorrectoAPIView)")
            return Response({"detail": "Error interno al obtener turnos."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2) Normalizar ids para la consulta a Informix (usamos local_list, igual que TurnosMergedAllAPIView)
        ids_list = [str(t.id_sisr) for t in local_list if getattr(t, 'id_sisr', None) is not None]

        # 3) Consultar Informix igual que en TurnosMergedAllAPIView, poblar ext_map
        ext_map_asig = {}
        ext_map_elim = {}
        try:
            with connections['informix'].cursor() as cur:

                # ejecutar sql1
                cur.execute(query_turnos(len(ids_list)), ids_list)
                rows = cur.fetchall()
                for row in rows:
                    turno_id = str(row[0])
                    ext_map_asig[turno_id] = {
                        'paciente_id': row[1],
                        'paciente_nombre': row[2],
                        'paciente_apellido': row[3],
                        'paciente_dni': row[4],
                        'profesional_nombre': row[5],
                        'profesional_apellido': row[6],
                    }
                
                cur.execute(query_eliminado(len(ids_list)), ids_list)
                rows = cur.fetchall()
                for row in rows:
                    turno_id = str(row[0])
                    ext_map_elim[turno_id] = {
                        'paciente_id': row[1],
                        'paciente_nombre': row[2],
                        'paciente_apellido': row[3],
                        'paciente_dni': row[4],
                        'profesional_nombre': row[5],
                        'profesional_apellido': row[6],
                    }

        except DatabaseError:
            logger.exception("Error consultando Informix (GetIncorrectoAPIView)")
            # seguimos y serializamos con campos informix en None si falla
        except Exception:
            logger.exception("Error inesperado consultando Informix (GetIncorrectoAPIView)")

        # 4) Inyectar los campos de Informix como atributos dinámicos sobre cada instancia Turno
        for turno in local_list:
            ext_asig = ext_map_asig.get(str(turno.id_sisr), {})
            # si no existe la key, devolvemos None (coherente con tus fields allow_null)
            if turno.id_paciente == ext_asig.get('paciente_id'):
                setattr(turno, 'paciente_nombre', ext_asig.get('paciente_nombre'))
                setattr(turno, 'paciente_apellido', ext_asig.get('paciente_apellido'))
                setattr(turno, 'paciente_dni', ext_asig.get('paciente_dni'))
                setattr(turno, 'profesional_nombre', ext_asig.get('profesional_nombre'))
                setattr(turno, 'profesional_apellido', ext_asig.get('profesional_apellido'))

            if (ext_asig.get('paciente_id') != turno.id_paciente):
                pac = fetch_paciente(id_persona=turno.id_paciente)
                if len(pac) > 0:
                    pac = pac.pop()
                    setattr(turno, 'paciente_nombre', pac['nombre'])
                    setattr(turno, 'paciente_apellido', pac['apellido'])
                    setattr(turno, 'paciente_dni', pac['nro_doc'])
                    setattr(turno, 'profesional_nombre', ext_asig.get('profesional_nombre'))
                    setattr(turno, 'profesional_apellido', ext_asig.get('profesional_apellido'))

            ext_elim = ext_map_elim.get(str(turno.id_sisr), {})
            if turno.id_paciente == ext_elim.get('paciente_id'):
                setattr(turno, 'paciente_nombre', ext_elim.get('paciente_nombre'))
                setattr(turno, 'paciente_apellido', ext_elim.get('paciente_apellido'))
                setattr(turno, 'paciente_dni', ext_elim.get('paciente_dni'))
                setattr(turno, 'profesional_nombre', ext_elim.get('profesional_nombre'))
                setattr(turno, 'profesional_apellido', ext_elim.get('profesional_apellido'))

        # 5) Serializar y devolver. Como le pasamos instancias Turno, los campos nested funcionarán.
        serializer = TurnoMergedSerializer(local_list, many=True)
        return Response({"response": serializer.data, "count": total})


class TurnosMergedAllAPIView(APIView):

    def get(self, request):
        cantidad = int(request.query_params.get('cantidad'))  # nuevo: cantidad a devolver
        efectores_param = request.query_params.getlist('efectores[]')
        servicios_param = request.query_params.getlist('servicios[]')
        offset = int(request.query_params.get('offset'))
        fecha_desde = request.query_params.get('fechaDesde')
        fecha_hasta = request.query_params.get('fechaHasta')
        ids_order = None  # mantendrá el orden solicitado por el cliente (si aplica)
        total = 0

        id_efectores = [int(p.strip()) for p in efectores_param] 
        id_servicios = [int(p.strip()) for p in servicios_param]

        if  len(id_efectores)==0:
            return Response(
                {"detail": "Debe proveer 'efector'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        filters = {'id_efe_ser_esp__id_efector__in': id_efectores}
        if len(id_servicios)>0:
            filters['id_efe_ser_esp__id_ser_esp__id_servicio__in'] = id_servicios
        if fecha_desde:
            filters['fecha__gte'] = fecha_desde
        if fecha_hasta:
            filters['fecha__lte'] = fecha_hasta

        try:
            qs = (
                Turno.objects
                .select_related(
                    "id_efe_ser_esp",
                    "id_efe_ser_esp__id_ser_esp",
                    "id_efe_ser_esp__id_ser_esp__id_servicio",
                    "id_efe_ser_esp__id_ser_esp__id_especialidad",
                )
                .filter(**filters)
                .order_by('-fecha', '-hora', '-id')
            )

            # calcular total antes del slicing (útil para paginación)
            total = qs.count()

            # aplicar offset y cantidad
            start = offset
            end = None if cantidad is None else (offset + cantidad)
            local_qs = qs[start:end]
            local_list = list(local_qs)

            if not local_list:
                return Response({"response":[], "count": 0}, status=status.HTTP_200_OK)

        except Exception:
            logger.exception("Error al obtener turnos locales")
            return Response({"detail": "Error interno al obtener turnos."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2) Normalizar ids para la consulta a Informix (igual que venías haciendo)
        ids_list = [str(t.id_sisr) for t in local_list]

        # 3) Consultar Informix igual que tenías, poblar ext_map
        ext_map_asig = {}
        ext_map_elim = {}
        try:
            with connections['informix'].cursor() as cur:
                cur.execute(query_turnos(len(ids_list)), ids_list)
                rows = cur.fetchall()
                for row in rows:
                    turno_id = str(row[0])
                    ext_map_asig[turno_id] = {
                        'paciente_id': row[1],
                        'paciente_nombre': row[2],
                        'paciente_apellido': row[3],
                        'paciente_dni': row[4],
                        'profesional_nombre': row[5],
                        'profesional_apellido': row[6],
                    }
                cur.execute(query_eliminado(len(ids_list)), ids_list)
                rows = cur.fetchall()
                for row in rows:
                    turno_id = str(row[0])
                    ext_map_elim[turno_id] = {
                        'paciente_id': row[1],
                        'paciente_nombre': row[2],
                        'paciente_apellido': row[3],
                        'paciente_dni': row[4],
                        'profesional_nombre': row[5],
                        'profesional_apellido': row[6],
                    }


        except DatabaseError:
            logger.exception("Error consultando Informix")
            # no detenemos la ejecución: seguimos y serializamos con campos informix en None si falla
        except Exception:
            logger.exception("Error inesperado consultando Informix")

        # 4) Inyectar los campos de Informix como atributos dinámicos sobre cada instancia Turno
        for turno in local_list:
            ext_asig = ext_map_asig.get(str(turno.id_sisr), {})
            # si no existe la key, devolvemos None (coherente con tus campos allow_null)
            if (turno.id_paciente ==  ext_asig.get('paciente_id')):
                setattr(turno, 'paciente_nombre', ext_asig.get('paciente_nombre'))
                setattr(turno, 'paciente_apellido', ext_asig.get('paciente_apellido'))
                setattr(turno, 'paciente_dni', ext_asig.get('paciente_dni'))
                setattr(turno, 'profesional_nombre', ext_asig.get('profesional_nombre'))
                setattr(turno, 'profesional_apellido', ext_asig.get('profesional_apellido'))
            
            if (ext_asig.get('paciente_id') != turno.id_paciente):
                pac = fetch_paciente(id_persona=turno.id_paciente)
                if len(pac) > 0:
                    pac = pac.pop()
                    setattr(turno, 'paciente_nombre',pac['nombre'] )
                    setattr(turno, 'paciente_apellido', pac['apellido'])
                    setattr(turno, 'paciente_dni',pac['nro_doc'])
                    setattr(turno, 'profesional_nombre', ext_asig.get('profesional_nombre'))
                    setattr(turno, 'profesional_apellido', ext_asig.get('profesional_apellido'))

            ext_elim = ext_map_elim.get(str(turno.id_sisr), {})
            if (turno.id_paciente ==  ext_elim.get('paciente_id')):
                setattr(turno, 'paciente_nombre', ext_elim.get('paciente_nombre'))
                setattr(turno, 'paciente_apellido', ext_elim.get('paciente_apellido'))
                setattr(turno, 'paciente_dni', ext_elim.get('paciente_dni'))
                setattr(turno, 'profesional_nombre', ext_elim.get('profesional_nombre'))
                setattr(turno, 'profesional_apellido', ext_elim.get('profesional_apellido'))
        # 5) Serializar y devolver. Como le pasamos instancias Turno, los campos nested funcionarán.
        serializer = TurnoMergedSerializer(local_list, many=True)
        return Response({"response": serializer.data, "count": total})

class TurnosAlertasAPIView(APIView):
    def get(self, request):

        try:
            cantidad = int(request.query_params.get('cantidad'))  # nuevo: cantidad a devolver
            efectores_param = request.query_params.getlist('efectores[]')
            servicios_param = request.query_params.getlist('servicios[]')
            offset = int(request.query_params.get('offset'))
            fecha_desde = request.query_params.get('fechaDesde')
            fecha_hasta = request.query_params.get('fechaHasta')
            tipo = request.query_params.get('tipo')
            total = 0

            id_efectores = [int(p.strip()) for p in efectores_param]
            id_servicios = [int(p.strip()) for p in servicios_param]

            if len(id_efectores) == 0 or tipo is None:
                return Response(
                    {"detail": "Debe proveer 'efector' y 'tipo'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            filters = {'id_efe_ser_esp__id_efector__in': id_efectores}
            if len(id_servicios) > 0:
                filters['id_efe_ser_esp__id_ser_esp__id_servicio__in'] = id_servicios
            if fecha_desde:
                filters['fecha__gte'] = fecha_desde
            if fecha_hasta:
                filters['fecha__lte'] = fecha_hasta

            try:
                qs = (
                    Turno.objects
                    .select_related("id_efe_ser_esp")
                    .filter(**filters)
                    .order_by('-fecha', '-hora', '-id')
                )

                # ------- Grupo A: estado=1 y estado_paciente=2 -------
                if tipo == 'cancelados':
                    qs = qs.filter(id_estado__id=1, id_estado_paciente__id=2)

                # ------- Grupo B: estado=1 y estado_paciente=3 -------
                if tipo == 'incorrectos':
                    qs = qs.filter(id_estado__id=1, id_estado_paciente__id=3)

                # ------- Grupo C: estado=1 y existe TurnoFlow -> Flow.id_plantilla_flow = 1 y Flow.id_estado = 0 -------
                if tipo == 'sin_respuesta':
                    qs = qs.filter(id_estado__id=1, id_estado_paciente__id=4)
               
                # calcular total antes del slicing (útil para paginación)
                total = qs.count()

                # aplicar offset y cantidad
                start = offset
                end = None if cantidad is None else (offset + cantidad)
                local_qs = qs[start:end]
                local_list = list(local_qs)

                if not local_list:
                    return Response({"response": [], "count": total}, status=status.HTTP_200_OK)

            except Exception:
                logger.exception("Error al obtener turnos locales")
                return Response({"detail": "Error interno al obtener turnos."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # 2) Normalizar ids para la consulta a Informix (igual que en TurnosMergedAllAPIView)
            ids_list = [str(t.id_sisr) for t in local_list if getattr(t, "id_sisr", None) is not None]

            # 3) Consultar Informix igual que en TurnosMergedAllAPIView, poblar ext_map_asig y ext_map_elim
            ext_map_asig = {}
            try:
                if ids_list:
                    with connections['informix'].cursor() as cur:
                        cur.execute(query_turnos(len(ids_list)), ids_list)
                        rows = cur.fetchall()
                        for row in rows:
                            turno_id = str(row[0])
                            ext_map_asig[turno_id] = {
                                'paciente_id': row[1],
                                'paciente_nombre': row[2],
                                'paciente_apellido': row[3],
                                'paciente_dni': row[4],
                                'profesional_nombre': row[5],
                                'profesional_apellido': row[6],
                            }


            except DatabaseError:
                logger.exception("Error consultando Informix")
            except Exception:
                logger.exception("Error inesperado consultando Informix")

            # 4) Inyectar los campos de Informix como atributos dinámicos sobre cada instancia Turno
            for turno in local_list:
                ext_asig = ext_map_asig.get(str(turno.id_sisr), {})
                # si no existe la key, devolvemos None (coherente con tus campos allow_null)
                if (turno.id_paciente == ext_asig.get('paciente_id')):
                    setattr(turno, 'paciente_nombre', ext_asig.get('paciente_nombre'))
                    setattr(turno, 'paciente_apellido', ext_asig.get('paciente_apellido'))
                    setattr(turno, 'paciente_dni', ext_asig.get('paciente_dni'))
                    setattr(turno, 'profesional_nombre', ext_asig.get('profesional_nombre'))
                    setattr(turno, 'profesional_apellido', ext_asig.get('profesional_apellido'))

                if (ext_asig.get('paciente_id') != turno.id_paciente):
                    # fallback a tu función fetch_paciente si la tenés definida
                    try:
                        pac = fetch_paciente(id_persona=turno.id_paciente)
                        if len(pac) > 0:
                            pac = pac.pop()
                            setattr(turno, 'paciente_nombre', pac['nombre'])
                            setattr(turno, 'paciente_apellido', pac['apellido'])
                            setattr(turno, 'paciente_dni', pac['nro_doc'])
                            # profesional sigue siendo el de ext_asig si existe
                            setattr(turno, 'profesional_nombre', ext_asig.get('profesional_nombre'))
                            setattr(turno, 'profesional_apellido', ext_asig.get('profesional_apellido'))
                    except Exception:
                        # si fetch_paciente falla, ignoramos y dejamos campos en None
                        logger.debug("fetch_paciente falló o no está disponible")

            # 5) Serializar y devolver. Como le pasamos instancias Turno, los campos nested funcionarán.
            serializer = TurnoMergedSerializer(local_list, many=True)
            return Response({"response": serializer.data, "count": total})

        except Exception:
            logger.exception("Error en turnos_agrupados_view")
            return Response({"detail": "Error interno al obtener grupos de turnos."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
