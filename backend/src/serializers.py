from django.contrib.auth.models import AbstractUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from src.models import CustomUser
from src.utils.utils import fetch_paciente, fetch_profesional, update_msg_state
import re
from django.utils import timezone
from datetime import datetime, date
from concurrent.futures import ThreadPoolExecutor


class PacienteSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    nombre = serializers.CharField(required=False, allow_null=True)
    apellido = serializers.CharField(required=False, allow_null=True)
    nro_doc = serializers.CharField(required=False, allow_null=True)    
    carac_telef = serializers.CharField(required=False, allow_null=True)
    nro_telef = serializers.CharField(required=False, allow_null=True)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    sexo = serializers.CharField(required=False, allow_null=True)
    nombre_calle = serializers.CharField(required=False, allow_null=True)
    numero_calle = serializers.IntegerField(required=False, allow_null=True)
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if rep.get("carac_telef"):
            rep["carac_telef"] = str(rep["carac_telef"]).replace(" ", "")
        if rep.get("nro_telef"):
            rep["nro_telef"] = str(rep["nro_telef"]).replace(" ", "")
        return rep

class ProfesionalSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    apellido = serializers.CharField(required=False, allow_null=True)
    nombre = serializers.CharField(required=False, allow_null=True)




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        data: dict[str, Any] = super().validate(attrs)

        user = cast(AbstractUser, self.user)
        data['username'] = user.username

        data['efectores'] = list(user.efectores.values('id', 'nombre'))
        return data
