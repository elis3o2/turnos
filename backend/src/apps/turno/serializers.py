from rest_framework import serializers
from concurrent.futures import ThreadPoolExecutor
from src.utils.utils import update_msg_state
import emoji
from .models import EstadoTurno, EstadoTurnoPaciente, Turno

class EstadoTurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoTurno
        fields = '__all__' 


class EstadoTurnoPacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoTurnoPaciente
        fields = '__all__' 



class TurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = '__all__'


class HistoricoPacienteSerializer(serializers.Serializer):
    idturno = serializers.IntegerField()
    fecha_hora_mdf = serializers.DateTimeField(allow_null=True, required=False)

    estado = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    paciente_nombre = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    paciente_apellido = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    nro_doc = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    nombre_profesional = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    apellido_profesional = serializers.CharField(allow_null=True, allow_blank=True, required=False)

    # Campo fecha modificado para truncar hora
    fecha = serializers.DateField(allow_null=True, required=False)

    hora = serializers.TimeField(allow_null=True, required=False)
    efector = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    servicio = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    especialidad = serializers.CharField(allow_null=True, allow_blank=True, required=False)




