from django.db import models
from src.apps.efector.models import EfeSerEsp
from src.apps.turno.models import Turno
from django.conf import settings

class TipoPlantilla(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=16)

    class Meta:
        managed = False
        db_table = 'tipo_plantilla'


class Plantilla(models.Model):
    id = models.AutoField(primary_key=True)
    contenido = models.TextField()
    tipo = models.ForeignKey(
        TipoPlantilla, models.DO_NOTHING, db_column='id_tipo')
    nombre = models.CharField(max_length=32)
    nombre_pac = models.BooleanField()
    apellido_pac = models.BooleanField()
    fecha = models.BooleanField()
    horaturno = models.BooleanField()
    nombre_prof = models.BooleanField()
    apellido_prof = models.BooleanField()
    especialidad = models.BooleanField()
    efector = models.BooleanField()
    servicio = models.BooleanField()
    calle = models.BooleanField()
    altura = models.BooleanField()
    letra = models.BooleanField()
    coordx = models.BooleanField()
    coordy = models.BooleanField()
    tel_efe = models.BooleanField()
    calle_nom = models.BooleanField()
    content_sid = models.CharField(max_length=64, blank=True, null=True)
    url = models.CharField(max_length=128, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'plantilla'


class EstadoMsj(models.Model):
    id = models.IntegerField(primary_key=True)
    significado = models.CharField(max_length=32)

    class Meta:
        managed = False
        db_table = 'estado_msj'


class EfeSerEspPlantilla(models.Model):
    id = models.AutoField(primary_key=True)
    efe_ser_esp = models.ForeignKey(
        EfeSerEsp, models.DO_NOTHING, db_column='id_efe_ser_esp')
    asignacion = models.IntegerField()
    reprogramacion = models.IntegerField()
    cancelacion = models.IntegerField()
    recordatorio = models.IntegerField()
    plantilla_asig = models.ForeignKey(
        Plantilla, models.DO_NOTHING, db_column='plantilla_asig',related_name="plantillas_conf", null=True, blank=True)
    plantilla_repr = models.ForeignKey(
        Plantilla, models.DO_NOTHING, db_column='plantilla_repr',related_name="plantillas_repr", null=True, blank=True)
    plantilla_canc = models.ForeignKey(
        Plantilla, models.DO_NOTHING, db_column='plantilla_canc',related_name="plantillas_canc", null=True, blank=True)
    plantilla_reco = models.ForeignKey(
        Plantilla, models.DO_NOTHING, db_column='plantilla_reco',related_name="plantillas_reco", null=True, blank=True)
    dias_antes = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'efe_ser_esp_plantilla'


class RegistroBanderas(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    efec_esp_serv_plantilla = models.ForeignKey(EfeSerEspPlantilla, on_delete=models.DO_NOTHING)
    bandera= models.ForeignKey(TipoPlantilla, on_delete=models.DO_NOTHING)
    valor_set  = models.IntegerField()
    plantilla  = models.ForeignKey(Plantilla, on_delete=models.DO_NOTHING, null=True)
    dias_antes  = models.IntegerField(null=True)
    fecha = models.DateTimeField(auto_now_add=True) 


class Sesion(models.Model):
    id = models.CharField(max_length=3, primary_key=True)
    numero = models.CharField(max_length=16)

    class Meta:
        managed = False
        db_table = 'sesion'


class Mensaje(models.Model):
    id = models.AutoField(primary_key=True)
    id_mensaje = models.CharField(max_length=255, null=True, blank=True)
    turno = models.ForeignKey(
        Turno, models.DO_NOTHING, db_column='id_turno', null=True, blank=True)
    numero = models.CharField(max_length=20)
    sesion = models.ForeignKey(
        Sesion, models.DO_NOTHING, db_column='id_sesion', null=True, blank=True)
    plantilla = models.ForeignKey(
        Plantilla, models.DO_NOTHING, db_column='id_plantilla')
    fecha_envio = models.DateTimeField()
    fecha_last_ack = models.DateTimeField(null=True, blank=True)
    estado = models.ForeignKey(
        EstadoMsj, models.DO_NOTHING, db_column='id_estado')

    class Meta:
        managed = False
        db_table = 'mensaje'







## FLOWS Y RESPUESTAS

class TipoNodo(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=16, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tipo_nodo'


class Nodo(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=24)
    msg = models.TextField(blank=True, null=True)
    tipo = models.ForeignKey(
        TipoNodo, models.DO_NOTHING, db_column='id_tipo')
    nodo_sig = models.ForeignKey(
        'self', models.DO_NOTHING, db_column='id_nodo_sig', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'nodo'


class Ruta(models.Model):
    id = models.AutoField(primary_key=True)
    nodo = models.ForeignKey(
        Nodo, models.DO_NOTHING, db_column='id_nodo', related_name='rutas_origen')
    nombre_ruta = models.CharField(max_length=16)
    nodo_sig = models.ForeignKey(
        Nodo, models.DO_NOTHING, db_column='id_nodo_sig',related_name='rutas_destino')

    class Meta:
        managed = False
        db_table = 'rutas'


class PlantillaFlow(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=24)
    nodo_inicio = models.ForeignKey(
        Nodo, models.DO_NOTHING, db_column='id_nodo_inicio')

    class Meta:
        managed = False
        db_table = 'plantilla_flow'
        

class EstadoFlow(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=16)

    class Meta:
        managed = False
        db_table = 'estado_flow'

class Flow(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    plantilla_flow = models.ForeignKey(
        PlantillaFlow, models.DO_NOTHING, db_column='id_plantilla_flow')
    sesion = models.ForeignKey(Sesion, models.DO_NOTHING, db_column='id_sesion')
    numero = models.CharField(max_length=15)
    fecha_inicio = models.DateTimeField()
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    estado =  models.ForeignKey(
        EstadoFlow, models.DO_NOTHING, db_column='id_estado')
    
    class Meta:
        managed = False
        db_table = 'flow'


class MsgFlowEnv(models.Model):
    id = models.AutoField(primary_key=True)
    flow = models.ForeignKey(
        Flow, models.DO_NOTHING, db_column='id_flow')
    nodo = models.ForeignKey(
        Nodo, models.DO_NOTHING, db_column='id_nodo')
    fecha_hora = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'msg_flow_env'


class MsgFlowRec(models.Model):
    id = models.AutoField(primary_key=True)    
    flow = models.ForeignKey(
        Flow, models.DO_NOTHING, db_column='id_flow')
    msg = models.TextField()
    fecha_hora = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'msg_flow_rec'


class TurnoFlow(models.Model):
    id = models.AutoField(primary_key=True)   
    turno = models.ForeignKey(Turno, models.DO_NOTHING, db_column='id_turno')
    flow = models.ForeignKey(Flow, models.DO_NOTHING, db_column='id_flow')

    class Meta:
        managed = False
        db_table = 'turno_flow'