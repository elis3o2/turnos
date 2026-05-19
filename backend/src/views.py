from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import HttpResponse
from .serializers import CustomTokenObtainPairSerializer
from django.shortcuts import render
from django.conf import settings
import json
import hmac
import hashlib
import requests

import logging
logger = logging.getLogger(__name__)


def frontend(request):
    return render(request, "index.html")


        

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class SendWSP(APIView):
    def post(self, request, *args, **kwargs):
        # Obtener parámetros del cuerpo de la solicitud
        numero = request.data.get('numero')
        msj = request.data.get('mensaje')

        # Validar que existan ambos parámetros
        if not numero or not msj:
            return Response(
                {'error': 'Se requieren numero y mensaje en el cuerpo de la solicitud'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return enviar_whatsapp(numero, msj)


class WhatsAppWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    VERIFY_TOKEN = "vibecoding"
    APP_SECRET = "TU_APP_SECRET"

    FORWARD_URL = "http://127.0.0.1:2880/webhook"

    def get(self, request):
        mode = request.GET.get("hub.mode")
        challenge = request.GET.get("hub.challenge")
        verify_token = request.GET.get("hub.verify_token")

        if mode == "subscribe" and verify_token == self.VERIFY_TOKEN:
            return HttpResponse(
                challenge,
                content_type="text/plain"
            )

        return HttpResponse(
            "Token inválido",
            status=403
        )

    def post(self, request):

        signature = request.headers.get("X-Hub-Signature-256")

        if not signature:
            return Response(
                {"error": "Falta firma"},
                status=status.HTTP_400_BAD_REQUEST
            )

        raw_body = request.body

        expected_signature = (
            "sha256=" +
            hmac.new(
                self.APP_SECRET.encode("utf-8"),
                raw_body,
                hashlib.sha256
            ).hexdigest()
        )

        if not hmac.compare_digest(signature, expected_signature):
            return Response(
                {"error": "Firma inválida"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            response = requests.post(
                self.FORWARD_URL,
                data=raw_body,
                headers={
                    "Content-Type": "application/json"
                },
                timeout=5
            )

            return Response(
                {
                    "status": "forwarded",
                    "target_status": response.status_code
                },
                status=200
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )


