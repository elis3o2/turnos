from rest_framework import serializers
from .models import Plantilla, EfeSerEspPlantilla, EstadoMsj, Mensaje
from src.apps.efector.serializers import EfeSerEspListSerializer, EspecialidadSerializer
from src.apps.turno.serializers import TurnoSerializer
import emoji


class PlantillaSerializer(serializers.ModelSerializer):
    contenido = serializers.SerializerMethodField()
    class Meta:
        model = Plantilla
        fields = '__all__'

    def get_contenido(self, obj):
        return emoji.emojize(obj.contenido or "")


class EfeSerEspPlantillaSerializer(serializers.ModelSerializer):
    efe_ser_esp = EfeSerEspListSerializer(source='efe_ser_esp', read_only=True)
    class Meta:
        model = EfeSerEspPlantilla
        fields = '__all__'

    def update(self, instance, validated_data):
        # request está en self.context cuando el serializer lo usa desde un ViewSet
        request = self.context.get("request")
        if request is not None:
            instance._usuario = request.user  # <-- setear antes de guardar
        # ahora llamar al update normal que hará instance.save() y disparará pre_save
        return super().update(instance, validated_data)


class EfeSerEspPlantillaDetailSerializer(serializers.ModelSerializer):
    especialidad = EspecialidadSerializer(source="efe_ser_esp.ser_esp.especialidad", read_only=True)
    id_efector = serializers.SerializerMethodField()
    id_servicio = serializers.SerializerMethodField()
    # HACEMOS LOS CAMPOS ESCRIBIBLES POR PK (aceptan un entero en el request)
    plantilla_conf = serializers.PrimaryKeyRelatedField(
        queryset=Plantilla.objects.all(), required=False, allow_null=True)
    plantilla_repr = serializers.PrimaryKeyRelatedField(
        queryset=Plantilla.objects.all(), required=False, allow_null=True)
    plantilla_canc = serializers.PrimaryKeyRelatedField(
        queryset=Plantilla.objects.all(), required=False, allow_null=True)
    plantilla_reco = serializers.PrimaryKeyRelatedField(
        queryset=Plantilla.objects.all(), required=False, allow_null=True)

    class Meta:
        model = EfeSerEspPlantilla
        fields = [
            "id",
            "id_efe_ser_esp",
            "id_efector",
            "id_servicio",
            "especialidad",
            "confirmacion",
            "plantilla_conf",
            "reprogramacion",
            "plantilla_repr",
            "cancelacion",
            "plantilla_canc",
            "recordatorio",
            "plantilla_reco",
            "dias_antes",
        ]

    def get_id_efector(self, obj):
        return obj.efe_ser_esp.efector_id if obj.efe_ser_esp else None

    def get_id_servicio(self, obj):
        return obj.efe_ser_esp.ser_esp.servicio_id if obj.efe_ser_esp else None

    def to_representation(self, instance):
        """
        Representación para la salida: queremos devolver los objetos 'Plantilla'
        anidados (igual que antes), no sólo los PKs.
        """
        rep = super().to_representation(instance)

        # reemplazamos los PKs por la representación anidada si existe
        rep["plantilla_conf"] = (
            PlantillaSerializer(instance.plantilla_conf).data if instance.plantilla_conf else None)
        rep["plantilla_repr"] = (
            PlantillaSerializer(instance.plantilla_repr).data if instance.plantilla_repr else None)
        rep["plantilla_canc"] = (
            PlantillaSerializer(instance.plantilla_canc).data if instance.plantilla_canc else None)
        rep["plantilla_reco"] = (
            PlantillaSerializer(instance.plantilla_reco).data if instance.plantilla_reco else None)

        return rep


class EstadoMsjSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoMsj
        fields = '__all__' 


class MensajeSerializer(serializers.ModelSerializer):
    turno = TurnoSerializer(source='turno', read_only=True)
    plantilla = PlantillaSerializer(source='plantilla', read_only=True)
    estado = EstadoMsjSerializer(source='estado', read_only=True)
    class Meta:
        model = Mensaje
        fields = '__all__'

