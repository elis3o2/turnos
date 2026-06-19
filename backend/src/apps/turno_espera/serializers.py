from rest_framework import serializers
from .models import EstadoTurnoEspera, EstudioRequerido, TurnoEspera, TurnoEsperaEstudio
from src.apps.efector.models import Efector, EfeSerEsp
from src.apps.efector.serializers import EfectorSerializer, ServicioSerializer, EspecialidadSerializer
from src.utils.utils import fetch_paciente, fetch_profesional
from src.apps.informix.serializers import PacienteSerializer, ProfesionalSerializer


class EstadoTurnoEsperaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoTurnoEspera
        fields = '__all__'


class EstudioRequeridoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstudioRequerido
        fields = '__all__'
        


class TurnoEsperaEstudioSerializer(serializers.ModelSerializer):
    estudio_requerido = EstudioRequeridoSerializer(read_only=True)

    class Meta:
        model = TurnoEsperaEstudio
        fields = [
            "id",
            "estudio_requerido",
            "estado",
            "fecha_cierre",
            "usuario_cierre",
        ]


class TurnoEsperaSerializer(serializers.ModelSerializer):
    # ---------- LECTURA ----------
    estado = EstadoTurnoEsperaSerializer(read_only=True)
    efector = EfectorSerializer(source="efe_ser_esp.efector", read_only=True)
    servicio = ServicioSerializer(source="efe_ser_esp.ser_esp.servicio", read_only=True)
    especialidad = EspecialidadSerializer(source="efe_ser_esp.ser_esp.especialidad", read_only=True)
    efector_solicitante = EfectorSerializer(read_only=True)
    estudios_requerido = TurnoEsperaEstudioSerializer(source="estudios_turno", many=True, read_only=True)
    paciente = serializers.SerializerMethodField()
    profesional_solicitante = serializers.SerializerMethodField()
    profesional_deriva = serializers.SerializerMethodField()
    fecha_hora_creacion = serializers.DateTimeField(read_only=True)
    # ---------- ESCRITURA ----------
    id_estado = serializers.PrimaryKeyRelatedField(source="estado", required=False, queryset=EstadoTurnoEspera.objects.all(), write_only=True)
    id_efector_solicitante = serializers.PrimaryKeyRelatedField(source="efector_solicitante", queryset=Efector.objects.all(), write_only=True)
    id_efe_ser_esp = serializers.PrimaryKeyRelatedField(source="efe_ser_esp", queryset=EfeSerEsp.objects.all(), write_only=True)
    ids_estudios_requerido = serializers.PrimaryKeyRelatedField(many=True, queryset=EstudioRequerido.objects.all(), source="estudios_requerido", write_only=True, required=False)

    id_paciente = serializers.IntegerField(write_only=True)
    id_profesional_solicitante = serializers.IntegerField(write_only=True)
    id_profesional_deriva = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = TurnoEspera
        fields = [
            # escritura
            "id_estado",
            "id_efector_solicitante",
            "id_efe_ser_esp",
            "ids_estudios_requerido",
            "id_paciente",
            "id_profesional_solicitante",
            "id_profesional_deriva",
            "prioridad",
            "cupo",

            # lectura
            "estado",
            "efector",
            "servicio",
            "especialidad",
            "efector_solicitante",
            "estudios_requerido",
            "paciente",
            "profesional_solicitante",
            "profesional_deriva",

            "id",
            "fecha_hora_creacion",
            "fecha_hora_cierre",
        ]

    def get_paciente(self, obj):
        pac = self.context.get("pac_map", {}).get(obj.id_paciente)
        return PacienteSerializer(pac).data if pac else None

    def get_profesional_solicitante(self, obj):
        prof = self.context.get("prof_map", {}).get(obj.id_profesional_solicitante)
        return ProfesionalSerializer(prof).data if prof else None
    
    def get_profesional_deriva(self, obj):
        prof = self.context.get("prof_map", {}).get(obj.id_profesional_deriva)
        return ProfesionalSerializer(prof).data if prof else None



