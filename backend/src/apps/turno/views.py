from django.db.models import Count, Sum
from django.db.models.functions import Coalesce
from django.core import signing
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import EstadoTurno, Turno
from .serializers import EstadoTurnoSerializer, TurnoSerializer
from src.permissions import ReadOnly, EfectorPermission
from src.utils.utils import fetch_paciente
from datetime import datetime
from django.utils import timezone
from src.apps.turno_espera.services import lista_espera_look
from src.apps.informix.services import liberar_turno

class EstadoTurnoViewSet(viewsets.ModelViewSet):
    queryset = EstadoTurno.objects.all()
    serializer_class = EstadoTurnoSerializer
    permission_classes = [IsAuthenticated, ReadOnly]


class TurnoViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer
    permission_classes = [IsAuthenticated, ReadOnly, EfectorPermission]
    efector_fields = "efe_ser_esp__efector"

    def _parse_csv_param(self, name: str) -> [int]:
        """
        Devuelve una lista de ints a partir de un query param tipo '1,2,3'
        o None si no existe / no hay valores válidos.
        Ignores non-integer values.
        """
        val = self.request.query_params.get(name)
        if not val:
            return None
        parts = [p.strip() for p in val.split(',') if p.strip() != ""]
        nums = []
        for p in parts:
            try:
                nums.append(int(p))
            except ValueError:
                # ignorar valores no convertibles para evitar 400s innecesarios
                continue
        return nums if nums else None

    def get_queryset(self):
        qs = super().get_queryset()
        rp = self.request.query_params

        servicios = self._parse_csv_param('id_ser_esp__id_servicio')
        especialidades = self._parse_csv_param('id_ser_esp__id_especialidad')
        efectores = self._parse_csv_param('id_efector')

        id_estado = rp.get('estado')
        if id_estado not in (None, ''):
            try:
                qs = qs.filter(estado=int(id_estado))
            except ValueError:
                pass

        if servicios:
            qs = qs.filter(efe_ser_esp__ser_esp__servicio__in=servicios)
        if especialidades:
            qs = qs.filter(efe_ser_esp__ser_esp__especialidad__in=especialidades)
        if efectores:
            qs = qs.filter(efe_ser_esp__efector__in=efectores)

        return qs



    @action(detail=False, methods=["get"], url_path="count")
    def count(self, request) -> Response:
        """
        Devuelve un JSON con el conteo de turnos según los filtros pasados,
        y además el conteo de cuántos tienen activadas las banderas:
          - msj_recordatorio
          - msj_cancelacion
          - msj_reprogramacion
          - msj_asignacion

        """
        qs = self.filter_queryset(self.get_queryset())  # aplica filtros DRF si los hay

        agg = qs.aggregate(
            total=Count('pk'),
            recordatorios=Coalesce(Sum('msj_recordatorio'), 0),
            cancelaciones=Coalesce(Sum('msj_cancelado'), 0),
            reprogramaciones=Coalesce(Sum('msj_reprogramado'), 0),
            asignaciones=Coalesce(Sum('msj_asignado'), 0),
        )

        # Asegurarnos de devolver enteros (Coalesce ya lo hace, pero por seguridad)
        result = {
            "count": int(agg.get("total", 0) or 0),
            "msj_recordatorio": int(agg.get("recordatorios", 0) or 0),
            "msj_cancelacion": int(agg.get("cancelaciones", 0) or 0),
            "msj_reprogramacion": int(agg.get("reprogramaciones", 0) or 0),
            "msj_asignacion": int(agg.get("asignaciones", 0) or 0),
        }

        return Response(result)




class TurnoPacienteView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        encoded_id = request.query_params.get("id")
        print(encoded_id)
        if not encoded_id:
            return Response(
                {"error": "Falta el id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            turno_id = signing.loads(encoded_id)
            print(turno_id)
        except Exception:
            return Response(
                {"error": "ID inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            turno = Turno.objects.get(pk=turno_id)
        except Turno.DoesNotExist:
            return Response(
                {"error": "Turno no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        resultado = fetch_paciente(ids=[turno.id_paciente])
        pac = resultado[0] if resultado else None

        return Response(
            {
                "nombre": str(pac['nombre']) if pac else None,
                "apellido": str(pac['apellido']) if pac else None,
                "fecha": turno.fecha,
                "hora": turno.hora,
                "efector": turno.efe_ser_esp.efector.nombre,
                "servicio": turno.efe_ser_esp.ser_esp.servicio.nombre,
                "especialidad": turno.efe_ser_esp.ser_esp.especialidad.nombre,
                "estado_pac": turno.estado_paciente_id,
                "estado": turno.estado.nombre
            },
            status=status.HTTP_200_OK
        )


    def put(self, request):
        encoded_id = request.data.get('id')
        estado = request.data.get('estado')

        if not encoded_id or not estado:
            return Response(
                {"error": "Faltan parámetros"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            turno_id = signing.loads(encoded_id)
            turno = Turno.objects.get(pk=turno_id)

            fecha_hora_turno = datetime.combine(turno.fecha, turno.hora)
            ahora = timezone.now()

            if fecha_hora_turno < ahora:
                return Response(
                    {"error": "No se puede modificar un turno que ya pasó"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            turno.estado_paciente_id = estado
            turno.fecha_estado_paciente = ahora
            turno.save()

            if estado == 2:
                lista_espera_look(turno)
                liberar_turno(turno.id_sisr)

            return Response(
                {"message": "Turno actualizado correctamente"},
                status=status.HTTP_200_OK
            )

        except ValueError:
            return Response(
                {"error": "ID inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Turno.DoesNotExist:
            return Response(
                {"error": "Turno no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )