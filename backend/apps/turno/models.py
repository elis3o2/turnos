from django.db import models
from apps.efector.models import EfeSerEsp


class EstadoTurno(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=32)

    class Meta:
        managed = False
        db_table = 'estado_turno'


class EstadoTurnoPaciente(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=32)

    class Meta:
        managed = False
        db_table = 'estado_turno_paciente'


class Turno(models.Model):
    id = models.AutoField(primary_key=True)
    id_sisr = models.IntegerField()
    id_paciente = models.IntegerField()
    estado = models.ForeignKey(
        EstadoTurno, models.DO_NOTHING, db_column='id_estado')
    estado_paciente = models.ForeignKey(
        EstadoTurnoPaciente, models.DO_NOTHING, default=0, db_column='id_estado_paciente')
    fecha = models.DateField()
    hora = models.TimeField()
    msj_confirmado = models.IntegerField()
    msj_reprogramado = models.IntegerField()
    msj_cancelado = models.IntegerField()
    msj_recordatorio = models.IntegerField()
    efe_ser_esp = models.ForeignKey(
        EfeSerEsp, models.DO_NOTHING, db_column='id_efe_ser_esp')

    class Meta:
        managed = False
        db_table = 'turno'


class LastMod(models.Model):
    fecha = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "last_mod"

