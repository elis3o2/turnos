from django.db import models


class Efector(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = 'efector'
        ordering = ['nombre']


class Servicio(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=64, )

    class Meta:
        managed = False
        db_table = 'servicio'
        ordering = ['nombre']


class Especialidad(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = 'especialidad'
        ordering = ['nombre']

class SerEsp(models.Model):
    id = models.IntegerField(primary_key=True)
    servicio = models.ForeignKey(
        Servicio, models.DO_NOTHING, db_column='id_servicio')
    especialidad = models.ForeignKey(
        Especialidad, models.DO_NOTHING, db_column='id_especialidad')
    
    class Meta:
        managed = False
        db_table = 'ser_esp'


class EfeSerEsp(models.Model):
    id  = models.IntegerField(primary_key=True)
    efector  = models.ForeignKey(
        Efector, models.DO_NOTHING, db_column='id_efector')
    ser_esp = models.ForeignKey(
        SerEsp, models.DO_NOTHING, db_column='id_ser_esp')
    
    class Meta:
        managed = False
        db_table = 'efe_ser_esp'
