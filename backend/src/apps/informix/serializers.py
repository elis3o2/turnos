from rest_framework import serializers
from src.apps.turno.models import Turno
from .services import build_mensajes_map
import re


class CleanCharField(serializers.CharField):
    def to_representation(self, value):
        if value is None:
            return None
        import re
        return re.sub(r"\s+", "", str(value))

class PacienteSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    nombre = serializers.CharField(required=False, allow_null=True)
    nro_doc = serializers.CharField(required=False, allow_null=True)
    apellido = serializers.CharField(required=False, allow_null=True)
    carac_telef = CleanCharField(required=False, allow_null=True)
    nro_telef = CleanCharField(required=False, allow_null=True)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    sexo = serializers.CharField(required=False, allow_null=True)
    nombre_calle = serializers.CharField(required=False, allow_null=True)
    numero_calle = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, data):
        for field in ["carac_telef", "nro_telef"]:
            if field in data and data[field] is not None:
                data[field] = str(data[field]).replace(" ", "")
        return data

class ProfesionalSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    apellido = serializers.CharField(required=False, allow_null=True)
    nombre = serializers.CharField(required=False, allow_null=True)


class TurnoMergedSerializer(serializers.ModelSerializer):
    efector = serializers.CharField(source="efe_ser_esp.efector.nombre", read_only=True)
    servicio = serializers.CharField(source="efe_ser_esp.ser_esp.servicio.nombre", read_only=True)
    especialidad = serializers.CharField(source="efe_ser_esp.ser_esp.especialidad.nombre", read_only=True)

    estado = serializers.CharField(source="estado.nombre", read_only=True)
    estado_paciente = serializers.CharField(source="estado_paciente.nombre", read_only=True)

    mensaje_asociado = serializers.SerializerMethodField()

    paciente_nombre = serializers.CharField(read_only=True)
    paciente_apellido = serializers.CharField(read_only=True)
    paciente_dni = serializers.CharField(read_only=True)
    profesional_nombre = serializers.CharField(read_only=True)
    profesional_apellido = serializers.CharField(read_only=True)

    msj_recordatorio = serializers.IntegerField(read_only=True)
    msj_asignado = serializers.IntegerField(read_only=True)
    msj_cancelado = serializers.IntegerField(read_only=True)
    msj_reprogramado = serializers.IntegerField(read_only=True)

    class Meta:
        model = Turno
        fields = [
            "id", "id_sisr", "fecha", "hora",
            "estado", "estado_paciente", "fecha_estado_paciente",
            "msj_recordatorio", "msj_asignado", "msj_cancelado", "msj_reprogramado",
            "efector", "servicio", "especialidad",
            "paciente_nombre", "paciente_apellido", "paciente_dni",
            "profesional_nombre", "profesional_apellido",
            "mensaje_asociado",
        ]

    def get_mensaje_asociado(self, obj):
        return self.context["mensajes_map"].get(obj.id, [])




class HistoricoPacienteSerializer(serializers.Serializer):
    idturno = serializers.IntegerField()
    fecha_hora_mdf = serializers.DateTimeField(allow_null=True, required=False)

    estado = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    paciente_nombre = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    paciente_apellido = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    nro_doc = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    profesional_nombre = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    profesional_apellido = serializers.CharField(allow_null=True, allow_blank=True, required=False)

    # Campo fecha modificado para truncar hora
    fecha = serializers.DateField(allow_null=True, required=False)

    hora = serializers.TimeField(allow_null=True, required=False)
    efector = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    servicio = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    especialidad = serializers.CharField(allow_null=True, allow_blank=True, required=False)




