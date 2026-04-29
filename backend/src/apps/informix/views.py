from __future__ import annotations
import csv
from django.http import HttpResponse
import logging
from typing import Any, Callable, Iterable, Optional
from django.db import DatabaseError, connections
from django.db.models import OuterRef, Q, QuerySet, Subquery
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
import json

from src.apps.turno.models import Turno
from src.apps.mensaje.models import Mensaje, TurnoFlow, Flow
from .serializers import TurnoMergedSerializer, HistoricoPacienteSerializer, PacienteSerializer, ProfesionalSerializer
from src.permissions import ReadOnly, EfectorPermission
from src.utils.querys_informix import query_turnos, query_eliminado, query_turno_historico_paciente, query_paciente_from_id
from src.utils.utils import fetch_paciente, fetch_profesional
from rest_framework.views import APIView
from .utils import (safe_int, get_params ,parse_int_list, asig_dic, setear_pac, setear_prof)
from .services import procesar_mensaje
logger = logging.getLogger(__name__)

TIPOS_MENSAJE = ("ASIGNACION", "CANCELACION", "REPROGRAMACION", "RECORDATORIO")



# ---------- API para búsquedas NO por id (retorna listas) ----------
class GetPacienteAPIView(APIView):
    def get(self, request) -> Response:
        dni = request.query_params.get("dni")

        try:
            if not dni:
                return Response(
                    {"detail": "Parámetro 'dni' requerido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            pacientes = fetch_paciente(dni=dni)
            ser = PacienteSerializer(instance=pacientes, many=True)
            print(ser.data)
            return Response(ser.data, status=status.HTTP_200_OK)

        except DatabaseError:
            logger.exception("Error consultando pacientes")
            return Response({"detail": "Error al consultar la base de datos."}, status=500)
        except Exception:
            logger.exception("Error inesperado en GetPacienteAPIView")
            return Response({"detail": "Error interno."}, status=500)



class GetProfesionalAPIView(APIView):
    def get(self, request) -> Response:
        id_efector = request.query_params.get("id_efector")
        nombre     = request.query_params.get("nombre")
        apellido   = request.query_params.get("apellido")

        try:
            if not id_efector:
                return Response(
                    {"detail": "Parámetro 'id_efector' requerido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            profs = fetch_profesional(
                id_efector=int(id_efector),
                nombre=nombre,
                apellido=apellido,
            )
            ser = ProfesionalSerializer(instance=profs, many=True)
            return Response(ser.data, status=status.HTTP_200_OK)

        except DatabaseError:
            logger.exception("Error consultando profesionales")
            return Response({"detail": "Error al consultar la base de datos."}, status=500)
        except Exception:
            logger.exception("Error inesperado en GetProfesionalAPIView")
            return Response({"detail": "Error interno."}, status=500)




# ============================================================
# Base class
# ============================================================

class BaseTurnosMerged(GenericAPIView):
    serializer_class = TurnoMergedSerializer
    permission_classes = [EfectorPermission]

    efector_field = "efe_ser_esp__efector"

    base_queryset = (
        Turno.objects.select_related(
            "efe_ser_esp",
            "efe_ser_esp__ser_esp",
            "efe_ser_esp__ser_esp__servicio",
            "efe_ser_esp__ser_esp__especialidad",
            "estado",
            "estado_paciente",
        )
        .order_by("-fecha", "-hora", "-id")
    )

    def get_queryset(self) -> QuerySet:
        return self.base_queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({
            "mensajes_map": getattr(self, "_mensajes_map", {}),
        })
        return context

    def wants_csv(self, request) -> bool:
        return str(request.query_params.get("csv", "")) == "1"

    def _csv_value(self, value: Any) -> str:
        if value is None:
            return ""
        if isinstance(value, (dict, list, tuple)):
            return json.dumps(value, ensure_ascii=False, default=str)  
        return str(value)

    
    def _flatten_row(self, row: dict[str, Any]) -> dict[str, Any]:
        """Descompone mensaje_asociado en columnas planas."""
        flat = {k: v for k, v in row.items() if k != "mensaje_asociado"}

        msg = row.get("mensaje_asociado") or {}
        for tipo in TIPOS_MENSAJE:
            data = msg.get(tipo) or {}
            prefix = tipo.lower()
            flat[f"{prefix}_estado"]      = data.get("estado")      if data else None
            flat[f"{prefix}_fecha_envio"] = data.get("fecha_envio") if data else None

        return flat

    def _build_csv_response(
        self, data: list[dict[str, Any]], filename: str = "turnos.csv"
    ) -> HttpResponse:
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response.write("\ufeff")

        if not data:
            return response

        # aplanar todas las filas primero
        flat_data = [self._flatten_row(row) for row in data]

        # recolectar fieldnames preservando orden
        fieldnames: list[str] = []
        seen: set[str] = set()
        for row in flat_data:
            for key in row:
                if key not in seen:
                    seen.add(key)
                    fieldnames.append(key)

        writer = csv.DictWriter(response, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for row in flat_data:
            writer.writerow({k: self._csv_value(row.get(k)) for k in fieldnames})

        return response


    # --------------------------------------------------------
    # API principal
    # --------------------------------------------------------

    def run_pipeline(self, request, get_qs_fn, build_filters_fn=None, paginate=True, csv_filename: str = "turnos.csv"):
        try:
            wants_csv = self.wants_csv(request)

            result = self.get_pipeline_data(
                request,
                get_qs_fn,
                build_filters_fn,
                paginate=not wants_csv, 
            )

            if wants_csv:
                return self._build_csv_response(result["data"], filename=csv_filename)

            return Response(result, status=200)

        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        except Exception:
            logger.exception("Error en pipeline")
            return Response({"detail": "Error interno"}, status=500)

    def get_pipeline_data(
        self,
        request,
        get_qs_fn,
        build_filters_fn=None,
        paginate=True,
    ):
        cantidad, offset, fecha_desde, fecha_hasta, id_efectores, id_servicios = get_params(request)

        if not id_efectores:
            raise ValueError("Debe proveer 'efector'.")

        build_filters_fn = build_filters_fn or self.build_filters
        filters = build_filters_fn(id_efectores, id_servicios, fecha_desde, fecha_hasta)

        qs = get_qs_fn(filters)

        total, local_list = self._paginate_qs_to_list(
            qs,
            offset,
            cantidad,
            paginate=paginate,
        )

        ids_list = [
            str(t.id_sisr)
            for t in local_list
            if getattr(t, "id_sisr", None) is not None
        ]

        ext_map_asig, ext_map_elim = self.fetch_informix_maps(ids_list)
        self.merge_external_data(local_list, ext_map_asig, ext_map_elim)

        self._mensajes_map = self.build_mensajes_map(local_list)

        serializer = self.get_serializer(local_list, many=True)
        return {
            "data": serializer.data,
            "count": total,
        }
    # --------------------------------------------------------
    # Filtros y paginación
    # --------------------------------------------------------

    def build_filters(
        self,
        id_efectores: list[int],
        id_servicios: list[int],
        fecha_desde: Optional[str],
        fecha_hasta: Optional[str],
    ) -> dict[str, Any]:
        filters: dict[str, Any] = {
            f"{self.efector_field}__in": id_efectores
        }

        if id_servicios:
            filters["efe_ser_esp__ser_esp__servicio__in"] = id_servicios

        if fecha_desde:
            filters["fecha__gte"] = fecha_desde

        if fecha_hasta:
            filters["fecha__lte"] = fecha_hasta

        return filters

    def _paginate_qs_to_list(
        self,
        qs: QuerySet,
        offset: int,
        cantidad: Optional[int],
        paginate: bool = True,
    ) -> tuple[int, list[Any]]:
        total = qs.count()

        if not paginate:
            return total, list(qs)

        start = max(offset or 0, 0)

        if cantidad is None or cantidad <= 0:
            local_qs = qs[start:]
        else:
            local_qs = qs[start:start + cantidad]

        return total, list(local_qs)

    # --------------------------------------------------------
    # Context para serializer
    # --------------------------------------------------------

    def build_mensajes_map(self, turnos: list[Any]) -> dict[int, dict[str, dict[str, Any]]]:
        turno_ids = [t.id for t in turnos]
        if not turno_ids:
            return {}

        mensajes = (
            Mensaje.objects
            .filter(turno_id__in=turno_ids)
            .select_related("plantilla", "estado")
            .order_by("-fecha_envio") 
        )

        result: dict[int, dict[str, dict[str, Any]]] = {
            tid: {} for tid in turno_ids
        }

        for m in mensajes:
            turno_id = m.turno_id
            tipo = m.plantilla.tipo.nombre


            if tipo not in result[turno_id]:
                result[turno_id][tipo] = procesar_mensaje(m)

        return result


    # --------------------------------------------------------
    # Informix
    # --------------------------------------------------------

    def fetch_informix_maps(self, ids_list: list[str]) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
        ext_map_asig: dict[str, dict[str, Any]] = {}
        ext_map_elim: dict[str, dict[str, Any]] = {}

        if not ids_list:
            return ext_map_asig, ext_map_elim

        try:
            with connections["informix"].cursor() as cur:
                cur.execute(query_turnos(len(ids_list)), ids_list)
                for row in cur.fetchall():
                    asig_dic(row, ext_map_asig)

                cur.execute(query_eliminado(len(ids_list)), ids_list)
                for row in cur.fetchall():
                    asig_dic(row, ext_map_elim)

        except DatabaseError:
            logger.exception("Error consultando Informix")
        except Exception:
            logger.exception("Error inesperado consultando Informix")

        return ext_map_asig, ext_map_elim

    # --------------------------------------------------------
    # Merge
    # --------------------------------------------------------

    def merge_external_data(
        self,
        local_list: list[Any],
        ext_map_asig: dict[str, dict[str, Any]],
        ext_map_elim: dict[str, dict[str, Any]],
    ) -> None:
        patient_ids_to_fetch: set[Any] = set()

        for turno in local_list:
            turno_id = str(getattr(turno, "id_sisr", ""))
            ext_asig = ext_map_asig.get(turno_id)
            ext_elim = ext_map_elim.get(turno_id)

            matched_any = False

            if ext_asig and getattr(turno, "id_paciente", None) == ext_asig.get("paciente_id"):
                setear_pac(turno, ext_asig)
                setear_prof(turno, ext_asig)
                matched_any = True

            if ext_elim and getattr(turno, "id_paciente", None) == ext_elim.get("paciente_id"):
                if not matched_any:
                    setear_pac(turno, ext_elim)
                    setear_prof(turno, ext_elim)
                else:
                    if not getattr(turno, "paciente_nombre", None):
                        setear_pac(turno, ext_elim)
                    if not getattr(turno, "profesional_nombre", None):
                        setear_prof(turno, ext_elim)
                matched_any = True

            if not matched_any and getattr(turno, "id_paciente", None) is not None:
                patient_ids_to_fetch.add(turno.id_paciente)

        paciente_map: dict[Any, dict[str, Any]] = {}

        if patient_ids_to_fetch:
            try:
                pacs = self.fetch_pacientes_bulk(list(patient_ids_to_fetch))
                paciente_map = self.normalize_patient_payload(pacs)
            except Exception:
                logger.exception("Error obteniendo pacientes en bloque")

        for turno in local_list:
            if getattr(turno, "paciente_nombre", None):
                continue

            pac = paciente_map.get(getattr(turno, "id_paciente", None))
            if not pac:
                continue

            setattr(turno, "paciente_nombre", pac.get("nombre"))
            setattr(turno, "paciente_apellido", pac.get("apellido"))
            setattr(turno, "paciente_dni", pac.get("nro_doc"))

    def fetch_pacientes_bulk(self, ids: list[Any]):
        return fetch_paciente(ids)

    def normalize_patient_payload(self, payload: Any) -> dict[Any, dict[str, Any]]:
        result: dict[Any, dict[str, Any]] = {}
        if not payload:
            return result

        items = [payload] if isinstance(payload, dict) else payload

        for item in items:
            if isinstance(item, dict):
                key = item.get("id") or item.get("id_persona") or item.get("pk")
            else:
                key = (
                    getattr(item, "id", None)
                    or getattr(item, "id_persona", None)
                    or getattr(item, "pk", None)
                )
                item = {
                    "id":        key,
                    "nombre":    getattr(item, "nombre",   None),
                    "apellido":  getattr(item, "apellido", None),
                    "nro_doc":   getattr(item, "nro_doc",  None),
                }

            if key is not None:
                result[key] = item

        return result


# ============================================================
# Views concretas
# ============================================================

class GetIncorrectoAPIView(BaseTurnosMerged):
    def get(self, request):
        def build_qs(filters: dict[str, Any]) -> QuerySet:
            latest_msg_qs = (
                Mensaje.objects
                .filter(turno_id=OuterRef("pk"))
                .order_by("-fecha_envio")
            )

            return (
                self.get_queryset()
                .annotate(latest_msg_estado=Subquery(latest_msg_qs.values("estado")[:1]))
                .filter(Q(latest_msg_estado__lt=0), **filters)
                .order_by("-fecha", "-hora", "-id")
            )

        return self.run_pipeline(request, build_qs, csv_filename="turnos_incorrectos.csv")


class TurnosMergedAllAPIView(BaseTurnosMerged):
    def get(self, request):
        def build_qs(filters: dict[str, Any]) -> QuerySet:
            return (
                self.get_queryset()
                .filter(**filters)
                .order_by("-fecha", "-hora", "-id")
            )

        return self.run_pipeline(request, build_qs, csv_filename="turnos_todos.csv")


class TurnosAlertasAPIView(BaseTurnosMerged):
    def get(self, request):
        tipo = request.query_params.get("tipo")
        if not tipo:
            return Response(
                {"detail": "Debe proveer 'tipo'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        def build_qs(filters: dict[str, Any]) -> QuerySet:
            qs = (
                self.get_queryset()
                .filter(**filters)
                .order_by("-fecha", "-hora", "-id")
            )

            if tipo == "rechazados":
                qs = qs.filter(estado__id=3, estado_paciente__id=2)
            elif tipo == "incorrectos":
                qs = qs.filter(estado__id=3, estado_paciente__id=3)
            elif tipo == "sin_respuesta":
                qs = qs.filter(estado__id=3, estado_paciente__id=4)

            return qs

        return self.run_pipeline(request, build_qs, csv_filename=f"turnos_alertas_{tipo}.csv")





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

