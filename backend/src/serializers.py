from django.contrib.auth.models import AbstractUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from typing import Any, cast
from .models import CustomUser



class KeyLabelSerializer(serializers.Serializer):
    key = serializers.IntegerField()
    label = serializers.CharField()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        data: dict[str, Any] = super().validate(attrs)

        user = cast(AbstractUser, self.user)
        data['username'] = user.username

        data['efectores'] = list(user.efectores.values('id', 'nombre'))
        return data
