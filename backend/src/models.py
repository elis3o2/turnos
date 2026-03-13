from django.db import models
from django.contrib.auth.models import AbstractUser
from core import settings
        

class CustomUser(AbstractUser):
    efectores = models.ManyToManyField(Efector, related_name="usuarios", blank=True)
    dni  = models.CharField(max_length=15, unique=True, null=True)

    def __str__(self):
        return self.username



