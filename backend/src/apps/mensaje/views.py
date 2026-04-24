from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EstadoMsj, Mensaje, Plantilla, EfeSerEspPlantilla
from .serializers import (EstadoMsjSerializer, MensajeSerializer, PlantillaSerializer,
                        EfeSerEspPlantilla, EfeSerEspPlantillaDetailSerializer)
from src.permissions import ReadOnly
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
        print(request.query_params.getlist("ids_efe[]"))
        ids_efectores    = request.query_params.getlist("ids_efe[]")
        ids_servicios    = request.query_params.getlist("ids_ser[]")
        ids_especialidades = request.query_params.getlist("ids_esp[]")
        ids_efectores = parse_int_list(ids_efectores)
        ids_servicios = parse_int_list(ids_servicios)
        ids_especialidades = parse_int_list(ids_especialidades)


        print(ids_efectores)
        # id_efectores es obligatorio
        if not ids_efectores:
            return Response(
                {"detail": "Se requiere al menos un efector."},
                status=400,
            )
 
        # ── Filtro base por efector ──────────────────────────────────────────
        qs = Mensaje.objects.filter(turno__efe_ser_esp__efector_id__in=ids_efectores)
 
        # ── Filtros opcionales ───────────────────────────────────────────────
        if ids_servicios:
            qs = qs.filter(turno__efe_ser_esp__ser_esp__servicio_id__in=ids_servicios)
 
        if ids_especialidades:
            qs = qs.filter(turno__efe_ser_esp__ser_esp_especialidad_id__in=ids_especialidades)
 
        # ── Totales por tipo de mensaje ──────────────────────────────────────
        totales = qs.aggregate(
            total_asignacion=Count("id", filter=Q(plantilla__tipo_id=1)),
            total_recordatorio=Count("id", filter=Q(plantilla__tipo_id=4)),
        )
 
        # ── Estados del mensaje de recordatorio ─────────────────────────────
        estados_recordatorio = (
            qs.filter(plantilla__tipo_id=4)
            .values("estado__significado")
            .annotate(count=Count("id"))
            .order_by("estado__significado")
        )
        # Renombrar la clave en la respuesta final
        estados_lista = [
            {"estado": item["estado__significado"], "count": item["count"]}
            for item in estados_recordatorio
        ]
        print(estados_lista)

        print({
            "total_asignacion": totales["total_asignacion"],
            "total_recordatorio": totales["total_recordatorio"],
            "estados_recordatorio": estados_lista,
        })
        return Response({
            "total_asignacion": totales["total_asignacion"],
            "total_recordatorio": totales["total_recordatorio"],
            "estados_recordatorio": estados_lista,
        })
 


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

