from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EstadoMsj, Mensaje, Plantilla, EfeSerEspPlantilla
from .serializers import (EstadoMsjSerializer, MensajeSerializer, PlantillaSerializer,
                        EfeSerEspPlantilla, EfeSerEspPlantillaDetailSerializer)
from src.permissions import ReadOnly



class EstadoMsjViewSet(viewsets.ModelViewSet):
    queryset = EstadoMsj.objects.all()
    serializer_class = EstadoMsjSerializer
    permission_classes = [ReadOnly]


class MensajeViewSet(viewsets.ModelViewSet):
    queryset = Mensaje.objects.all()
    serializer_class = MensajeSerializer
    permission_classes = [ReadOnly]
 

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

