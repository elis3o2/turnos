from django.contrib.auth.models import AbstractUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from typing import Any, cast
from .models import CustomUser
from .utils.utils import fetch_paciente, fetch_profesional, update_msg_state



class KeyLabelSerializer(serializers.Serializer):
    key = serializers.IntegerField()
    label = serializers.CharField()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        data: dict[str, Any] = super().validate(attrs)

        user = cast(AbstractUser, self.user)
        data['username'] = user.username

        data['efectores'] = [ {"key": ef.id, "label": ef.nombre}
                                for ef in user.efectores.all()]
        return data
