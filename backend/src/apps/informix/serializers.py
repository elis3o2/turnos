from rest_framework import serializers
from src.apps.turno.models import Turno
from .services import build_mensajes_map

class PacienteSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    nombre = serializers.CharField(required=False, allow_null=True)
    apellido = serializers.CharField(required=False, allow_null=True)
    nro_doc = serializers.CharField(required=False, allow_null=True)    
    carac_telef = serializers.CharField(required=False, allow_null=True)
    nro_telef = serializers.CharField(required=False, allow_null=True)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    sexo = serializers.CharField(required=False, allow_null=True)
    nombre_calle = serializers.CharField(required=False, allow_null=True)
    numero_calle = serializers.IntegerField(required=False, allow_null=True)
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if rep.get("carac_telef"):
            rep["carac_telef"] = str(rep["carac_telef"]).replace(" ", "")
        if rep.get("nro_telef"):
            rep["nro_telef"] = str(rep["nro_telef"]).replace(" ", "")
        return rep

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
    msj_confirmado = serializers.IntegerField(read_only=True)
    msj_cancelado = serializers.IntegerField(read_only=True)
    msj_reprogramado = serializers.IntegerField(read_only=True)

    class Meta:
        model = Turno
        fields = [
            "id", "id_sisr", "fecha", "hora",
            "estado", "estado_paciente", "fecha_estado_paciente",
            "msj_recordatorio", "msj_confirmado", "msj_cancelado", "msj_reprogramado",
            "efector", "servicio", "especialidad",
            "paciente_nombre", "paciente_apellido", "paciente_dni",
            "profesional_nombre", "profesional_apellido",
            "mensaje_asociado",
        ]

    def get_mensaje_asociado(self, obj):
        return self.context["mensajes_map"].get(obj.id, [])



    
