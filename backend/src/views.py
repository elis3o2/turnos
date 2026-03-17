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

from typing import Callable, Tuple
from django.db import DatabaseError, connections
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

class BaseTurnosMerged:
    """
    Mixin que ejecuta el pipeline común:
     - parsea params
     - valida efectores
     - construye filters (pero la llave base puede variar)
     - obtiene QS local vía get_qs_fn(filters)
     - pagina
     - consulta Informix y arma ext_map_asig/ext_map_elim
     - mergea datos externos en instancias Turno
     - serializa y devuelve
    """

    def run_pipeline(self, request, get_qs_fn: Callable[[dict], 'QuerySet']) -> Response:
        # 1) params
        cantidad, offset, fecha_desde, fecha_hasta, id_efectores, id_servicios = get_params(request)

        if not id_efectores:
            return Response({"detail": "Debe proveer 'efector'."}, status=status.HTTP_400_BAD_REQUEST)

        # 2) filtros comunes
        filters = self.build_filters(id_efectores, id_servicios, fecha_desde, fecha_hasta)

        # 3) obtener qs local (función provista por la view)
        try:
            qs = get_qs_fn(filters)

            total, local_list = self._paginate_qs_to_list(qs, offset, cantidad)

            if not local_list:
                return Response({"response": [], "count": 0}, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Error al obtener turnos locales")
            return Response({"detail": "Error interno al obtener turnos."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4) normalizar ids para Informix
        ids_list = [str(t.id_sisr) for t in local_list if getattr(t, "id_sisr", None) is not None]
        # 5) consultar Informix
        ext_map_asig, ext_map_elim = self.fetch_informix_maps(ids_list)

        # 6) merge (usa fetch_pacientes bulk si está disponible)
        self.merge_external_data(local_list, ext_map_asig, ext_map_elim)

        # 7) serializar y responder
        serializer = TurnoMergedSerializer(local_list, many=True)
        return Response({"response": serializer.data, "count": total})

    def build_filters(self, id_efectores, id_servicios, fecha_desde, fecha_hasta) -> dict:
        """Filtro por defecto — si una view necesita otra estructura, puede construirla en su get antes."""
        filters = {'efe_ser_esp__efector__in': id_efectores}
        if id_servicios:
            filters['efe_ser_esp__ser_esp__servicio__in'] = id_servicios
        if fecha_desde:
            filters['fecha__gte'] = fecha_desde
        if fecha_hasta:
            filters['fecha__lte'] = fecha_hasta
        return filters

    def _paginate_qs_to_list(self, qs, offset: int, cantidad: int) -> Tuple[int, list]:
        total = qs.count()
        start = offset or 0
        end = None if cantidad is None else (start + cantidad)
        local_qs = qs[start:end]
        return total, list(local_qs)

    def fetch_informix_maps(self, ids_list: list) -> Tuple[dict, dict]:
        """Devuelve (ext_map_asig, ext_map_elim). Maneja ids_list vacío y errores."""
        ext_map_asig = {}
        ext_map_elim = {}
        if not ids_list:
            return ext_map_asig, ext_map_elim

        try:
            with connections['informix'].cursor() as cur:
                cur.execute(query_turnos(len(ids_list)), ids_list)
                rows = cur.fetchall()
                for row in rows:
                    asig_dic(row, ext_map_asig)

                cur.execute(query_eliminado(len(ids_list)), ids_list)
                rows = cur.fetchall()
                for row in rows:
                    asig_dic(row, ext_map_elim)

        except DatabaseError:
            logger.exception("Error consultando Informix")
        except Exception:
            logger.exception("Error inesperado consultando Informix")
        return ext_map_asig, ext_map_elim

    def merge_external_data(self, local_list: list, ext_map_asig: dict, ext_map_elim: dict) -> None:
        """
        Merge optimizado:
         - recolecta ids de pacientes que necesitamos buscar en batch
         - intenta usar `fetch_pacientes(ids)` si existe, si no cae al per-turn `fetch_paciente`
        """
        # 1) setear datos cuando coinciden
        patient_ids_to_fetch = set()
        for turno in local_list:
            ext_asig = ext_map_asig.get(str(turno.id_sisr), {})
            if turno.id_paciente == ext_asig.get('paciente_id'):
                setear_pac(turno, ext_asig)
                setear_prof(turno, ext_asig)
            else:
                # si ext_asig no coincide, tendremos que buscar datos locales del paciente
                patient_ids_to_fetch.add(turno.id_paciente)

            ext_elim = ext_map_elim.get(str(turno.id_sisr), {})
            if turno.id_paciente == ext_elim.get('paciente_id'):
                setear_pac(turno, ext_elim)
                setear_prof(turno, ext_elim)

        # 2) obtener pacientes en bulk (si tu proyecto puede hacerlo)
        paciente_map = {}
        try:
            # Si tienes una función que trae varios pacientes a la vez, úsala (más eficiente)
            if patient_ids_to_fetch:
                # ejemplo: si exists fetch_pacientes(ids) -> retorna lista/dict
                if 'fetch_pacientes' in globals():
                    pacs = fetch_pacientes(list(patient_ids_to_fetch))
                    # normalizar a dict {id_persona: {nombre,apellido,nro_doc}}
                    paciente_map = {p['id_persona']: p for p in pacs}
                else:
                    # fallback: llamar a fetch_paciente por cada id (tu código actual)
                    for pid in patient_ids_to_fetch:
                        try:
                            pac = fetch_paciente(id_persona=pid)
                            if pac:
                                paciente_map[pid] = pac.pop()
                        except Exception:
                            logger.debug("fetch_paciente falló para id %s", pid)
        except Exception:
            logger.exception("Error obteniendo pacientes en bloque")

        # 3) inyectar campos faltantes usando paciente_map
        for turno in local_list:
            ext_asig = ext_map_asig.get(str(turno.id_sisr), {})
            if ext_asig.get('paciente_id') != turno.id_paciente:
                pac = paciente_map.get(turno.id_paciente)
                if pac:
                    setattr(turno, 'paciente_nombre', pac.get('nombre'))
                    setattr(turno, 'paciente_apellido', pac.get('apellido'))
                    setattr(turno, 'paciente_dni', pac.get('nro_doc'))
                    setear_prof(turno, ext_asig)


# ---- ahora las views usando el mixin ----

class GetIncorrectoAPIView(BaseTurnosMerged, APIView):
    def get(self, request):
        def build_qs(filters):
            latest_msg_qs = Mensaje.objects.filter(id_turno=OuterRef('pk')).order_by('-fecha_envio')
            return (
                Turno.objects
                .select_related("id_efe_ser_esp")
                .annotate(latest_msg_estado=Subquery(latest_msg_qs.values('id_estado')[:1]))
                .filter(Q(latest_msg_estado__lt=0), **filters)
                .order_by('-fecha', '-hora', '-id')
            )
        return self.run_pipeline(request, build_qs)


class TurnosMergedAllAPIView(BaseTurnosMerged, APIView):
    def get(self, request):
        def build_qs(filters):
            return (
                Turno.objects
                .select_related(
                    "efe_ser_esp",
                    "efe_ser_esp__ser_esp",
                    "efe_ser_esp__ser_esp__servicio",
                    "efe_ser_esp__ser_esp__especialidad",
                )
                .filter(**filters)
                .order_by('-fecha', '-hora', '-id')
            )
        return self.run_pipeline(request, build_qs)


class TurnosAlertasAPIView(BaseTurnosMerged, APIView):
    def get(self, request):
        tipo = request.query_params.get('tipo')
        if not tipo:
            return Response({"detail": "Debe proveer 'tipo'."}, status=status.HTTP_400_BAD_REQUEST)

        def build_qs(filters):
            qs = (
                Turno.objects
                .select_related("id_efe_ser_esp")
                .filter(**filters)
                .order_by('-fecha', '-hora', '-id')
            )
            if tipo == 'cancelados':
                qs = qs.filter(estado__id=1, estado_paciente__id=2)
            elif tipo == 'incorrectos':
                qs = qs.filter(estado__id=1, estado_paciente__id=3)
            elif tipo == 'sin_respuesta':
                qs = qs.filter(estado__id=1, estado_paciente__id=4)
            return qs

        # Nota: TurnosAlertas usa diferente nombre de campo para efectores en tu ejemplo original.
        # Si eso es fijo, sobreescribe build_filters localmente:
        def build_filters_alertas(id_efectores, id_servicios, fecha_desde, fecha_hasta):
            filters = {'efe_ser_esp__efector__in': id_efectores}
            if id_servicios:
                filters['efe_ser_esp__ser_esp__servicio__in'] = id_servicios
            if fecha_desde:
                filters['fecha__gte'] = fecha_desde
            if fecha_hasta:
                filters['fecha__lte'] = fecha_hasta
            return filters

        # corto: llamar al pipeline pero usando la versión personalizada de build_filters
        # para eso temporalmente parcheamos self.build_filters (alternativa: extraer build_filters como parámetro)
        original_build_filters = self.build_filters
        try:
            self.build_filters = build_filters_alertas
            return self.run_pipeline(request, build_qs)
        finally:
            self.build_filters = original_build_filters




def asig_dic(row: tuple, dic: dict[str, InformixData]) -> None:
    turno_id = str(row[0])
    dic[turno_id] = {
        'paciente_id': row[1],
        'paciente_nombre': row[2],
        'paciente_apellido': row[3],
        'paciente_dni': row[4],
        'profesional_nombre': row[5],
        'profesional_apellido': row[6],
    }

def setear_pac(turno: Any, dic: dict) -> None:
    setattr(turno, 'paciente_nombre', dic.get('paciente_nombre'))
    setattr(turno, 'paciente_apellido', dic.get('paciente_apellido'))
    setattr(turno, 'paciente_dni', dic.get('paciente_dni'))

def setear_prof(turno: Any, dic: dict) -> None:
    setattr(turno, 'profesional_nombre', dic.get('profesional_nombre'))
    setattr(turno, 'profesional_apellido', dic.get('profesional_apellido'))


def get_params(request) -> tuple[int, int, str | None, str | None, list[int], list[int]]:
    cantidad = int(request.query_params.get('cantidad', 0))
    offset = int(request.query_params.get('offset', 0))

    fecha_desde = request.query_params.get('fechaDesde')
    fecha_hasta = request.query_params.get('fechaHasta')

    efectores_param = request.query_params.getlist('efectores[]')
    servicios_param = request.query_params.getlist('servicios[]')

    id_efectores = [int(p.strip()) for p in efectores_param]
    id_servicios = [int(p.strip()) for p in servicios_param]

    return (cantidad, offset, fecha_desde, fecha_hasta, id_efectores, id_servicios)


from typing import TypedDict

class InformixData(TypedDict, total=False):
    paciente_id: int
    paciente_nombre: str
    paciente_apellido: str
    paciente_dni: str
    profesional_nombre: str
    profesional_apellido: str