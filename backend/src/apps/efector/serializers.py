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
    especialidad_deriva = EspecialidadSerializer(source='efe_ser_esp_deriva.ser_esp.especialidad', read_only=True)
    class Meta:
        model = Deriva
        fields = '__all__'


class DerivaCreateSerializer(serializers.Serializer):
    id_efe = serializers.IntegerField()
    id_efe_der = serializers.IntegerField()
    id_ser_der = serializers.IntegerField()
    id_esp_der = serializers.IntegerField()

    def validate(self, data):
        try:
            efe_ser_esp = EfeSerEsp.objects.get(
                efector_id=data["id_efe_der"],
                ser_esp__servicio_id=data["id_ser_der"],
                ser_esp__especialidad_id=data["id_esp_der"],
            )
        except EfeSerEsp.DoesNotExist:
            raise serializers.ValidationError(
                "La combinación efector/servicio/especialidad destino no existe."
            )

        existe = Deriva.objects.filter(
            efector_id=data["id_efe"],
            efe_ser_esp_deriva=efe_ser_esp,
        ).exists()

        if existe:
            raise serializers.ValidationError(
                "Ya existe una derivación con esos datos."
            )

        data["efe_ser_esp"] = efe_ser_esp
        return data