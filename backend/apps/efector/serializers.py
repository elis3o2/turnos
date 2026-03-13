from rest_framework import serializers
from .models import Efector, Servicio, Especialidad, SerEsp, EfeSerEsp

class EfectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Efector
        fields = ["id", "nombre"]


class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ["id", "nombre"]


class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = ["id", "nombre"]



class EfeSerEspSerializer(serializers.ModelSerializer):    
    id_servicio = serializers.IntegerField(source='id_ser_esp.id_servicio.id',read_only=True)
    id_especialidad = serializers.IntegerField(source='id_ser_esp.id_especialidad.id',read_only=True)
    class Meta:
        model = EfeSerEsp
        fields = ['id', 'id_efector', 'id_servicio', 'id_especialidad']



class EfeSerEspEfectorSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="id_efector.id", read_only=True)
    nombre = serializers.CharField(source="id_efector.nombre", read_only=True)
    class Meta:
        model = EfeSerEsp
        fields = ["id", "nombre"]


class EfeSerEspCompletoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    efector = EfectorSerializer(source='id_efector', read_only=True)
    servicio = ServicioSerializer(source='id_ser_esp.id_servicio', read_only=True)
    especialidad = EspecialidadSerializer(source='id_ser_esp.id_especialidad', read_only=True)
    class Meta:
        model = EfeSerEsp
        fields = ["id", "efector", "servicio", "especialidad"]

