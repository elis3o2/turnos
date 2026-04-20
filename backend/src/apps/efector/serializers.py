from rest_framework import serializers
from .models import Efector, Servicio, Especialidad, SerEsp, EfeSerEsp, Deriva

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



class EfeSerEspListSerializer(serializers.ModelSerializer):    
    id_efector = serializers.IntegerField(source='efector.id', read_only=True)
    id_servicio = serializers.IntegerField(source='ser_esp.servicio.id',read_only=True)
    id_especialidad = serializers.IntegerField(source='ser_esp.especialidad.id',read_only=True)
    class Meta:
        model = EfeSerEsp
        fields = ['id', 'id_efector', 'id_servicio', 'id_especialidad']



class EfeSerEspEfectorSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="efector.id", read_only=True)
    nombre = serializers.CharField(source="efector.nombre", read_only=True)
    class Meta:
        model = EfeSerEsp
        fields = ["id", "nombre"]


class EfeSerEspDetailSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    efector = EfectorSerializer(read_only=True)
    servicio = ServicioSerializer(source='ser_esp.servicio', read_only=True)
    especialidad = EspecialidadSerializer(source='ser_esp.especialidad', read_only=True)
    class Meta:
        model = EfeSerEsp
        fields = ["id", "efector", "servicio", "especialidad"]


class DerivaSerializer(serializers.ModelSerializer):
    efector = EfectorSerializer(read_only=True)
    efector_deriva = EfectorSerializer(source='efe_ser_esp_deriva.efector', read_only=True)
    servicio_deriva = ServicioSerializer(source='efe_ser_esp_deriva.ser_esp.servicio', read_only=True)
    especialidad_deriva = EspecialidadSerializer(source='efe_ser_esp_deriva.ser_esp.iespecialidad', read_only=True)
    class Meta:
        model = Deriva
        fields = '__all__'
