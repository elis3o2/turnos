from collections import defaultdict
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EstadoMsj, Mensaje, Plantilla, EfeSerEspPlantilla
from .serializers import (EstadoMsjSerializer, MensajeSerializer, PlantillaSerializer,
                        EfeSerEspPlantilla, EfeSerEspPlantillaDetailSerializer)
from src.permissions import ReadOnly, OnlyConfiguracionUpdatePermission
from django.db.models import Count, Q, F
from src.utils.utils import parse_int_list

class EstadoMsjViewSet(viewsets.ModelViewSet):
    queryset = EstadoMsj.objects.all()
    serializer_class = EstadoMsjSerializer
    permission_classes = [ReadOnly]


class MensajeViewSet(viewsets.ModelViewSet):
    queryset = Mensaje.objects.all()
    serializer_class = MensajeSerializer
    permission_classes = [ReadOnly]

    @action(detail=False, methods=["get"], url_path="count")
    def count(self, request) -> Response:
        ids_efectores = request.query_params.getlist("ids_efe[]")
        ids_servicios = request.query_params.getlist("ids_ser[]")
        ids_especialidades = request.query_params.getlist("ids_esp[]")

        fecha_desde = request.query_params.get("fecha_desde")
        fecha_hasta = request.query_params.get("fecha_hasta")

        ids_efectores = parse_int_list(ids_efectores)
        ids_servicios = parse_int_list(ids_servicios)
        ids_especialidades = parse_int_list(ids_especialidades)

        if not ids_efectores:
            return Response(
                {"detail": "Se requiere al menos un efector."},
                status=400,
            )

        qs = Mensaje.objects.filter(
            turno__efe_ser_esp__efector_id__in=ids_efectores
        )

        if ids_servicios:
            qs = qs.filter(
                turno__efe_ser_esp__ser_esp__servicio_id__in=ids_servicios
            )

        if ids_especialidades:
            qs = qs.filter(
                turno__efe_ser_esp__ser_esp_especialidad_id__in=ids_especialidades
            )

        if fecha_desde:
            qs = qs.filter(fecha_envio__gte=fecha_desde)

        if fecha_hasta:
            qs = qs.filter(fecha_envio__lte=fecha_hasta)


        # Ajustá estos IDs si en tu sistema son otros
        TIPO_ASIGNACION = 1
        TIPO_CANCELACION = 2
        TIPO_REPROGRAMACION = 3
        TIPO_RECORDATORIO = 4

        totales = qs.aggregate(
            total=Count("id"),
            total_asignacion=Count("id", filter=Q(plantilla__tipo_id=TIPO_ASIGNACION)),
            total_cancelacion=Count("id", filter=Q(plantilla__tipo_id=TIPO_CANCELACION)),
            total_reprogramacion=Count(
                "id", filter=Q(plantilla__tipo_id=TIPO_REPROGRAMACION)
            ),
            total_recordatorio=Count("id", filter=Q(plantilla__tipo_id=TIPO_RECORDATORIO)),
        )

        # Recordatorios agrupados por estado del mensaje y estado del turno
        # Si tu FK en Turno se llama id_estado, cambiá turno__estado__significado por turno__id_estado__significado
        recordatorios = (
            qs.filter(plantilla__tipo_id=TIPO_RECORDATORIO)
            .values("estado__significado", "turno__estado__nombre")
            .annotate(count=Count("id"))
            .order_by("estado__id", "turno__estado__id")
        )

        mapa_estados = {}
        for item in recordatorios:
            estado = item["estado__significado"] or "Sin estado"
            estado_turno = item["turno__estado__nombre"] or "Sin estado"

            if estado not in mapa_estados:
                mapa_estados[estado] = {
                    "estado": estado,
                    "estado_turno": [],
                    "count": 0,
                }

            mapa_estados[estado]["estado_turno"].append(
                {
                    "estado_turno": estado_turno,
                    "count": item["count"],
                }
            )

            mapa_estados[estado]["count"] += item["count"]

        estados_lista = list(mapa_estados.values())

        return Response(
            {
                "total": totales["total"],
                "total_asignacion": totales["total_asignacion"],
                "total_cancelacion": totales["total_cancelacion"],
                "total_reprogramacion": totales["total_reprogramacion"],
                "total_recordatorio": totales["total_recordatorio"],
                "estados_recordatorio": estados_lista,
            }
        )


class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    permission_classes = [ReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        id_tipo = self.request.query_params.get("id_tipo")
        if id_tipo:
            queryset = queryset.filter(tipo=id_tipo)
        return queryset


class EfeSerEspPlantillaViewSet(viewsets.ModelViewSet):
    queryset = EfeSerEspPlantilla.objects.all()
    serializer_class = EfeSerEspPlantillaDetailSerializer
    permission_classes = [OnlyConfiguracionUpdatePermission]

    @action(detail=False, methods=["get"], url_path="buscar")
    def search(self, request) -> Response:
        id_efector = request.query_params.get("id_efector")
        id_servicio = request.query_params.get("id_servicio")

        queryset = self.get_queryset()
        if id_efector:
            queryset = queryset.filter(efe_ser_esp__efector=id_efector)
        if id_servicio:
            queryset = queryset.filter(efe_ser_esp__servicio=id_servicio)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="detalle")
    def search_detalle(self, request) -> Response:
        id_efector = request.query_params.get("id_efector")
        id_servicio = request.query_params.get("id_servicio")

        queryset = self.get_queryset()

        # Filtros opcionales
        if id_efector:
            queryset = queryset.filter(efe_ser_esp__efector=id_efector)
        if id_servicio:
            queryset = queryset.filter(efe_ser_esp__ser_esp__servicio=id_servicio)

        # Optimización de consultas y ordenamiento
        queryset = (
            queryset.select_related(
                "efe_ser_esp",
                "plantilla_asig",
                "plantilla_repr",
                "plantilla_canc",
                "plantilla_reco",
            )
            .order_by(
                "efe_ser_esp__ser_esp__especialidad__nombre",
            )
        )

        # Serialización y respuesta ordenada
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

