from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import F
from .models import Efector, Servicio, Especialidad, EfeSerEsp
from .serializers import (EfectorSerializer, ServicioSerializer, EspecialidadSerializer, 
                        EfeSerEspDetailSerializer, EfeSerEspListSerializer,EfeSerEspEfectorSerializer)
from src.serializers import KeyLabelSerializer
from src.permissions import ReadOnly
from src.views import KeyLabelMixin
from src.serializers import KeyLabelSerializer
from collections import OrderedDict

class EfectorViewSet(KeyLabelMixin, viewsets.ModelViewSet):
    queryset = Efector.objects.all()
    serializer_class = EfectorSerializer
    permission_classes = [ReadOnly]


class ServicioViwSet(KeyLabelMixin, viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [ReadOnly]



class EspecialidadViewSet(KeyLabelMixin, viewsets.ModelViewSet):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [ReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        id_servicio = self.request.query_params.get("id_servicio")
        if id_servicio:
            qs = qs.filter(servicio=id_servicio)
        return qs


class EfeSerEspViewSet(viewsets.ModelViewSet):
    queryset = EfeSerEsp.objects.all()
    serializer_class = EfeSerEspListSerializer
    permission_classes = [ReadOnly]

    @action(detail=False, methods=["get"], url_path="servicios")
    def servicios_por_efector(self, request):

        ids_efec = request.query_params.getlist("ids_efec")
        if not ids_efec:
            return Response(
                {"detail": "Debe enviar al menos un efector"},
                status=400
            )

        queryset = self.get_queryset().filter(efector_id__in=ids_efec)
        servicios = (
            queryset
            .values(
                key=F("ser_esp__servicio_id"),
                label=F("ser_esp__servicio__nombre"),
            )
            .distinct()
            .order_by("label")
        )
        serializer = KeyLabelSerializer(servicios, many=True)
        return Response(serializer.data)



    @action(detail=False, methods=["get"], url_path="ser_esp")
    def serv_esp_por_efector(self, request) -> Response:
        id_efector = request.query_params.get("id_efector")
        if not id_efector:
            return Response({"detail": "Debe enviar id_efector como query param"}, status=400)

        try:
            id_efector = int(id_efector)
        except (TypeError, ValueError):
            return Response({"detail": "id_efector inválido"}, status=400)

        qs = (
            self.get_queryset()
            .filter(efector=id_efector)
            .values(
                "id",
                "ser_esp__servicio",
                "ser_esp__servicio__nombre",
                "ser_esp__especialidad",
                "ser_esp__especialidad__nombre",
            )
            .distinct()
            .order_by("ser_esp__servicio__nombre", "ser_esp__especialidad__nombre")
        )

        # Agrupamos por servicio en memoria (una pasada)
        servicios_map = OrderedDict()
        for row in qs:
            id = row["id"]
            sid = row["ser_esp__servicio"]
            sname = row["ser_esp__servicio__nombre"]
            eid = row.get("ser_esp__especialidad")
            ename = row.get("ser_esp__especialidad__nombre")

            if sid not in servicios_map:
                servicios_map[sid] = {
                    "id_ser": sid,
                    "ser_nombre": sname,
                    "especialidades": []
                }

            # Si hay especialidad (podría ser NULL), la agregamos evitando duplicados
            if eid is not None:
                servicios_map[sid]["especialidades"].append({
                    "id_esp": eid,
                    "esp_nombre": ename,
                    "id_efe_ser_esp": id
                })

        servicios = list(servicios_map.values())
        return Response(servicios)

    @action(detail=False, methods=["get"], url_path="efectores")
    def get_efectores(self, request) -> Response:
        id_servicio = request.query_params.get("id_ser")
        id_especialidad = request.query_params.get("id_esp")

        queryset = self.get_queryset()

        try:
            if id_especialidad:
                queryset = queryset.filter(especialidad=int(id_especialidad))
            if id_servicio:
                queryset = queryset.filter(servicio=int(id_servicio))
        except ValueError:
            return Response(
                {"detail": "Parámetros inválidos. 'id_ser' e 'id_esp' deben ser enteros."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = EfeSerEspEfectorSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["get"], url_path="id")
    def get_id(self, request) -> Response:
        id_efector = request.query_params.get("efector")
        id_servicio = request.query_params.get("servicio")
        id_especialidad = request.query_params.get("especialidad")
        
        if not id_efector or not id_servicio or not id_especialidad:
            return Response(
                {"detail": "Faltan datos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.get_queryset()

        try:
            queryset = queryset.get(
                efector=int(id_efector),
                ser_esp__servicio=int(id_servicio),
                ser_esp__especialidad=int(id_especialidad),
            )
        except ValueError:
            return Response(
                {"detail": "Parámetros inválidos. 'efector', 'servicio' y 'especialidad' deben ser enteros."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = EfeSerEspDetailSerializer(queryset)
        return Response(serializer.data, status=status.HTTP_200_OK)



