from rest_framework import serializers
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


