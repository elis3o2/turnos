import requests
from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import HttpResponse
from .serializers import CustomTokenObtainPairSerializer
from django.shortcuts import render
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from src.apps.turno.models import Turno
from src.apps.mensaje.models import Mensaje
from src.apps.mensaje.services import sendMessage 


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

    FORWARD_URL = "http://127.0.0.1:2880/webhook"

    @transaction.atomic
    def post(self, request):

        # Reenviar el webhook al servicio del puerto 2880
        try:
            session = requests.Session()
            session.trust_env = False

            session.post(
                self.FORWARD_URL,
                data=request.body,
                headers={
                    "Content-Type": request.headers.get("Content-Type", "application/x-www-form-urlencoded")
                },
                timeout=5
            )

        except Exception as e:
            print(f"Error reenviando webhook a 2880: {e}")

        data = request.POST

        if data.get("MessageType") == "button":

            original_sid = data.get("OriginalRepliedMessageSid")
            button_payload = data.get("ButtonPayload")
            from_number = data.get("From")

            try:
                mensaje = (
                    Mensaje.objects
                    .select_for_update()
                    .select_related("id_turno")
                    .get(id_mensaje=original_sid)
                )

                print("MENSAJE:", mensaje)

                turno = mensaje.id_turno

                print("TURNO:", turno)

                if turno.id_estado_paciente == 4:

                    turno.id_estado_paciente = int(button_payload)
                    turno.fecha_hora_paciente = timezone.localtime()
                    turno.save(update_fields=[
                        "id_estado_paciente",
                        "fecha_hora_paciente",
                    ])

                    men = sendMessage(
                        "Gracias por su respuesta",
                        from_number
                    )

                    print("RESPUESTA TWILIO:", men)

            except Exception:
                import traceback
                traceback.print_exc()
                raise