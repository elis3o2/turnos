from rest_framework import serializers
from .models import EstadoTurno, EstadoTurnoPaciente, Turno
from apps.mensaje.models import Mensaje
from datetime import datetime, date

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



class TurnoMergedSerializer(serializers.ModelSerializer):
    efe_ser_esp  = EfeSerEspCompletoSerializer(source="id_efe_ser_esp", read_only=True)

    msj_recordatorio = serializers.IntegerField(read_only=True, allow_null=True)
    msj_confirmado = serializers.IntegerField(read_only=True, allow_null=True)
    msj_cancelado = serializers.IntegerField(read_only=True, allow_null=True)
    msj_reprogramado = serializers.IntegerField(read_only=True, allow_null=True)
    fecha_estado_paciente = serializers.SerializerMethodField()
    # Campos extra desde Informix
    paciente_nombre = serializers.CharField(read_only=True, allow_null=True)
    paciente_apellido = serializers.CharField(read_only=True, allow_null=True)
    paciente_dni = serializers.CharField(read_only=True, allow_null=True)
    profesional_nombre = serializers.CharField(read_only=True, allow_null=True)
    profesional_apellido = serializers.CharField(read_only=True, allow_null=True)

    estado = EstadoTurnoSerializer(source="id_estado", read_only=True)
    estado_paciente = EstadoTurnoPacienteSerializer(source="id_estado_paciente", read_only=True)
    # Nuevo campo dinámico
    mensaje_asociado = serializers.SerializerMethodField()
    
    class Meta:
        model = Turno
        fields = [
            "id","fecha", "hora", "estado", "estado_paciente", "fecha_estado_paciente",
            "msj_recordatorio", "msj_confirmado", "msj_cancelado", "msj_reprogramado",
            "efe_ser_esp",
            "paciente_nombre", "paciente_apellido", "paciente_dni",
            "profesional_nombre", "profesional_apellido",
            "mensaje_asociado",  
        ]
    @staticmethod
    def procesar_mensaje(m: Mensaje):
        if 0 <= m.id_estado_id < 3:
            update_msg_state(m)

        return {
            "id": m.id,
            "id_mensaje": m.id_mensaje,
            "numero": m.numero if m.numero else None,
            "fecha_envio": m.fecha_envio if m.fecha_envio else None,
            "estado": {
                "id": m.id_estado.id if m.id_estado else None,
                "significado": m.id_estado.significado if m.id_estado else None,
            } if m.id_estado else None,
            "plantilla": {
                "id": m.id_plantilla.id if m.id_plantilla else None,
                "contenido": emoji.emojize(m.id_plantilla.contenido)
                if m.id_plantilla else None,
                "tipo": {
                    "id": m.id_plantilla.id_tipo.id,
                    "nombre": m.id_plantilla.id_tipo.nombre,
                } if m.id_plantilla and m.id_plantilla.id_tipo else None,
            } if m.id_plantilla else None,
            "fecha_last_ack": m.fecha_last_ack if m.fecha_last_ack else None,
        }


    def get_mensaje_asociado(self, obj):
        """
        Devuelve la lista de mensajes asociados al turno,
        solo si alguno de los msj_* está en 1.
        """
        
        mensajes = (
             Mensaje.objects.filter(id_turno=obj.id)
             .select_related("id_plantilla__id_tipo", "id_estado")
             .order_by("-fecha_envio")
            )
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            dic = list(executor.map(self.procesar_mensaje, mensajes))
        return dic
    
    def get_fecha_estado_paciente(self, obj):
        flow_ids = TurnoFlow.objects.filter(id_turno=obj.id).values_list("id_flow", flat=True)

        # usar obj.id_estado_id (atributo del modelo Turno)
        if obj.id_estado_id in (1, 2):
            flow = (
                Flow.objects.filter(id__in=flow_ids, id_plantilla_flow=1)
                .order_by("fecha_cierre")
                .first()
            )
            return flow.fecha_cierre if flow else None

        flow = (
            Flow.objects.filter(id__in=flow_ids, id_plantilla_flow=1)
            .order_by("fecha_inicio")
            .first()
        )
        return flow.fecha_inicio if flow else None


