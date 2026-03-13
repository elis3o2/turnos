from django.db import models
from apps.efector.models import Efector, EfeSerEsp
from apps.src.models import CustomUser

class Deriva(models.Model):
    id = models.AutoField(primary_key=True)
    efector = models.ForeignKey(
        Efector, models.DO_NOTHING, db_column='id_efector')
    efe_ser_esp_deriva = models.ForeignKey(
        EfeSerEsp, models.DO_NOTHING, db_column='id_efe_ser_esp_deriva')
    cupo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'deriva'


class EstadoTurnoEspera(models.Model):
    id = models.IntegerField(primary_key=True)  # equivale a TINYINT UNSIGNED
    significado = models.CharField(max_length=16)

    class Meta:
        managed = False
        db_table = 'estado_turno_espera'


class TurnoEspera(models.Model):
    id = models.AutoField(primary_key=True)
    estado = models.ForeignKey(
        EstadoTurnoEspera, models.DO_NOTHING, db_column='id_estado')
    id_profesional_solicitante = models.IntegerField()
    efector_solicitante = models.ForeignKey(
        Efector, models.DO_NOTHING, db_column="id_efector_solicitante")
    efe_ser_esp = models.ForeignKey(
        EfeSerEsp, models.DO_NOTHING, db_column='id_efe_ser_esp')
    id_paciente = models.IntegerField()
    prioridad = models.IntegerField()
    fecha_hora_creacion = models.DateTimeField()
    fecha_hora_cierre = models.DateTimeField(null=True, blank=True)
    cupo = models.BooleanField()
    usuario_creacion = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='turnos_creados')
    usuario_cierre = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='turnos_cerrados', null=True, blank=True)
    estudios_requerido = models.ManyToManyField(
        'EstudioRequerido', through='TurnoEsperaEstudio')

    class Meta:
        db_table = 'turno_espera'
        managed = True


class EstudioRequerido(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=32)

    class Meta:
        managed = False
        db_table = 'estudio_requerido'


class TurnoEsperaEstudio(models.Model):
    id = models.AutoField(primary_key=True)
    turno_espera  = models.ForeignKey(
        TurnoEspera,  models.DO_NOTHING, db_column='id_turno_espera', related_name='estudios_turno')
    estudio_requerido  = models.ForeignKey(
        EstudioRequerido, models.DO_NOTHING, db_column='id_estudio_requerido')
    estado = models.BooleanField(db_column='estado', default=0)
    fecha_cierre = models.DateTimeField(db_column='fecha_cierre', null=True, blank=True)
    usuario_cierre = models.ForeignKey(
        CustomUser, models.DO_NOTHING, db_column='id_usuario_cierre', null=True, blank=True)

    class Meta:
        db_table = 'turno_espera_estudio'
