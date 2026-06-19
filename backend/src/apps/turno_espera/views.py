from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import  EstudioRequerido, TurnoEspera, TurnoEsperaEstudio
from .serializers import EstudioRequeridoSerializer, TurnoEsperaSerializer, TurnoEsperaEstudioSerializer
from src.permissions import ReadOnly
from .permissions import TurnoEsperaCreatePermission, TurnoEsperaUpdatePermission, TurnoEsperaReadPermission
from src.utils.utils import fetch_paciente, fetch_profesional
from src.apps.efector.models import EfeSerEsp

class EstudioRequeridoViewSet(viewsets.ModelViewSet):
    serializer_class = EstudioRequeridoSerializer
    queryset = EstudioRequerido.objects.all()
    permission_classes = [ ReadOnly]


class TurnoEsperaViewSet(viewsets.ModelViewSet):
    serializer_class = TurnoEsperaSerializer
    queryset = TurnoEspera.objects.select_related(
        "estado",
        "efe_ser_esp__efector",
        "efe_ser_esp__ser_esp__servicio",
        "efe_ser_esp__ser_esp__especialidad",
        "efector_solicitante",
        "usuario_creacion",
        "usuario_cierre",
    ).prefetch_related(
        "estudios_turno__estudio_requerido"
        )



    def get_permissions(self):
        if self.action == "create":
            return [TurnoEsperaCreatePermission()]

        if self.action in ["marcar_estudios", "close_turno"]:
            return [TurnoEsperaUpdatePermission()]

        return [TurnoEsperaReadPermission()]
    # ----------------------------------------------------
    # LISTA ESPERA
    # ----------------------------------------------------
    @action(detail=False, methods=["get"], url_path="espera")
    def search_detalle(self, request):

        id_efector = request.query_params.get("id_efector")
        queryset = self.get_queryset().filter(estado_id=0)

        if id_efector:
            queryset = queryset.filter(
                Q(efe_ser_esp__efector_id=id_efector, cupo=False) |
                Q(efector_solicitante_id=id_efector, cupo=True)
            )

        # ---- batch ids ----
        ids_prof = list({
            prof_id
            for t in queryset
            for prof_id in (t.id_profesional_solicitante, t.id_profesional_deriva)
            if prof_id
        })
        ids_pac  = list({t.id_paciente for t in queryset if t.id_paciente})

        profesionales = fetch_profesional(ids=ids_prof) if ids_prof else []
        pacientes     = fetch_paciente(ids=ids_pac, ext=True) if ids_pac else []

        prof_map = {p["id"]: p for p in profesionales}
        pac_map  = {p["id"]: p for p in pacientes}

        serializer = self.get_serializer(
            queryset,
            many=True,
            context={
                "prof_map": prof_map,
                "pac_map": pac_map,
            },
        )
        return Response(serializer.data)
    # ----------------------------------------------------
    # DERIVACIONES
    # ----------------------------------------------------
    @action(detail=False, methods=["get"], url_path="deriva")
    def search_deriva(self, request):

        id_efector = request.query_params.get("id_efector")
        id_deriva = request.query_params.get("id_deriva")

        if not id_efector or not id_deriva:
            return Response({"detail": "Faltan datos"}, status=400)

        queryset = self.get_queryset().filter(
            estado_id=0,
            efe_ser_esp__efector_id=id_efector,
            efector_solicitante_id=id_deriva,
        )

        ids_prof = list({
            prof_id
            for t in queryset
            for prof_id in (t.id_profesional_solicitante, t.id_profesional_deriva)
            if prof_id
        })
        ids_pac  = list({t.id_paciente for t in queryset if t.id_paciente})

        profesionales = fetch_profesional(ids=ids_prof) if ids_prof else []
        pacientes     = fetch_paciente(ids=ids_pac, ext=True) if ids_pac else []

        prof_map = {p["id"]: p for p in profesionales}
        pac_map  = {p["id"]: p for p in pacientes}

        serializer = self.get_serializer(
            queryset,
            many=True,
            context={
                "prof_map": prof_map,
                "pac_map": pac_map,
            },
        )

        return Response(serializer.data)

    # ----------------------------------------------------
    # BUSCAR POR PACIENTE
    # ----------------------------------------------------
    @action(detail=False, methods=["get"], url_path="paciente")
    def search_paciente(self, request):

        id_paciente = request.query_params.get("id")
        queryset = self.get_queryset()

        if id_paciente:
            queryset = queryset.filter(id_paciente=id_paciente) 

        ids_profesionales = list(set(queryset.values_list("id_profesional_solicitante", flat=True)))  
        profesionales = fetch_profesional(ids=ids_profesionales) if ids_profesionales else []

        prof_map = {p["id"]: p for p in profesionales}

        serializer = self.get_serializer(
            queryset,
            many=True,
            context={
                "prof_map": prof_map,
            }
        )

        return Response(serializer.data)

    # ----------------------------------------------------
    # MARCAR ESTUDIOS
    # ----------------------------------------------------

    @action(detail=True, methods=["post"], url_path="marcar-estudios")
    def marcar_estudios(self, request, pk=None):

        turno = self.get_object()
        estudios_ids = request.data.get("estudios", [])

        if not isinstance(estudios_ids, list) or not estudios_ids:
            return Response(
                {"error": "Debe enviar una lista de estudios"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = TurnoEsperaEstudio.objects.filter(
            turno_espera=turno,
            id__in=estudios_ids,
            estado=False,
        )

        updated_ids = list(qs.values_list("id", flat=True))

        now = timezone.now()
        user = request.user if request.user.is_authenticated else None

        updated = qs.update(
            estado=True,
            fecha_cierre=now,
            usuario_cierre=user,
        )

        updated_qs = TurnoEsperaEstudio.objects.filter(id__in=updated_ids)

        serializer = TurnoEsperaEstudioSerializer(updated_qs, many=True)
        return Response(
            {
                "ok": True,
                "actualizados": updated,
                "estudios": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ----------------------------------------------------
    # CREATE
    # ----------------------------------------------------
    def create(self, request, *args, **kwargs):

        paciente = request.data.get("id_paciente")
        efe_ser_esp = request.data.get("id_efe_ser_esp")

        if paciente and efe_ser_esp:
            ser_esp_id = (
                EfeSerEsp.objects
                .filter(pk=efe_ser_esp)
                .values_list("ser_esp_id", flat=True)
                .first()
            )

            if ser_esp_id and TurnoEspera.objects.filter(
                id_paciente=paciente,
                efe_ser_esp__ser_esp_id=ser_esp_id,
                estado_id=0,
            ).exists():
                return Response(
                    {"detail": "Ya se encuentra el mismo turno en la lista"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            instance = serializer.save(
                usuario_creacion=request.user,
                fecha_hora_creacion=timezone.now(),
                estado_id=False
            )

            return Response(
                self.get_serializer(instance).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # ----------------------------------------------------
    # CERRAR TURNO
    # ----------------------------------------------------

    @action(detail=True, methods=["post"], url_path="close")
    def close_turno(self, request, pk=None):

        turno = self.get_object()

        if turno.estado_id != 0:
            return Response(
                {"detail": "El turno ya no está en espera"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        turno.estado_id = 1
        turno.fecha_hora_cierre = timezone.now()
        turno.usuario_cierre = request.user

        turno.save(
            update_fields=[
                "estado",
                "fecha_hora_cierre",
                "usuario_cierre",
            ]
        )

        return Response(self.get_serializer(turno).data)
