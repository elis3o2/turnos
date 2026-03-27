from rest_framework import serializers
from .models import Deriva, EstadoTurnoEspera, EstudioRequerido, TurnoEspera, TurnoEsperaEstudio
from src.apps.efector.models import Efector, EfeSerEsp
from src.apps.efector.serializers import EfectorSerializer, ServicioSerializer, EspecialidadSerializer
from src.utils.utils import fetch_paciente, fetch_profesional

class DerivaSerializer(serializers.ModelSerializer):
    efector = EfectorSerializer(read_only=True)
    efector_deriva = EfectorSerializer(source='efe_ser_esp_deriva.efector', read_only=True)
    servicio_deriva = ServicioSerializer(source='efe_ser_esp_deriva.ser_esp.servicio', read_only=True)
    especialidad_deriva = EspecialidadSerializer(source='efe_ser_esp_deriva.ser_esp.iespecialidad', read_only=True)
    class Meta:
        model = Deriva
        fields = '__all__'


class EstadoTurnoEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoTurnoEspera
        fields = '__all__'


class EstudioRequeridoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstudioRequerido
        fields = '__all__'
        

class TurnoEsperaSerializer(serializers.ModelSerializer):
    # ---------- LECTURA ----------
    estado = EstadoTurnoEsperaSerializer(source="estado", read_only=True)
    efector = EfectorSerializer(source="efe_ser_esp.efector", read_only=True)
    servicio = ServicioSerializer(source="efe_ser_esp.ser_esp.servicio", read_only=True)
    especialidad = EspecialidadSerializer(source="efe_ser_esp.ser_esp.especialidad", read_only=True)
    efector_solicitante = EfectorSerializer(source="efector_solicitante", read_only=True)
    estudio_requerido = EstudioRequeridoSerializer(many=True, read_only=True)
    paciente = serializers.SerializerMethodField()
    profesional_solicitante = serializers.SerializerMethodField()

    # ---------- ESCRITURA ----------
    id_estado = serializers.PrimaryKeyRelatedField(source="estado", queryset=EstadoTurnoEspera.objects.all(), write_only=True)
    id_efector_solicitante = serializers.PrimaryKeyRelatedField(source="efector_solicitante", queryset=Efector.objects.all(), write_only=True)
    id_efe_ser_esp = serializers.PrimaryKeyRelatedField(source="efe_ser_esp", queryset=EfeSerEsp.objects.all(), write_only=True)
    ids_estudios_requerido = serializers.PrimaryKeyRelatedField(many=True, queryset=EstudioRequerido.objects.all(), source="estudios_requerido", write_only=True, required=False)

    id_paciente = serializers.IntegerField(write_only=True)
    id_profesional_solicitante = serializers.IntegerField(write_only=True,)

    class Meta:
        model = TurnoEspera
        fields = "__all__"

    def get_paciente(self, obj):
        return {
            "id": obj.id_paciente.id,
            "nombre": obj.id_paciente.nombre,
            "apellido": obj.id_paciente.apellido,
        }

    def get_profesional_solicitante(self, obj):
        if not obj.id_profesional_solicitante:
            return None
        return {
            "id": obj.id_profesional_solicitante.id,
            "nombre": obj.id_profesional_solicitante.nombre,
        }



class EstudioRequeridoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstudioRequerido
        fields = '__all__'
