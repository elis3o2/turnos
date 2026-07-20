import requests
from decouple import config
from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import render
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse, HttpResponseForbidden
from django.utils import timezone
from .serializers import CustomTokenObtainPairSerializer
from src.apps.turno.models import Turno
from src.apps.mensaje.models import Mensaje
from src.apps.mensaje.services import sendMessage, procesar_estado_mensaje
from src.apps.turno_espera.services import lista_espera_look
from src.apps.informix.services import liberar_turno
from twilio.request_validator import RequestValidator


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

    validator = RequestValidator(config("TWILIO_AUTH_TOKEN"))
    webhook_url = config("TWILIO_WEBHOOK")

    @transaction.atomic
    def post(self, request):

        # Guardar el cuerpo ANTES de acceder a request.POST
        raw_body = request.body

        # Parsear el formulario una sola vez
        data = request.POST

        # ------------------------------------------------------------
        # Validar que el webhook realmente provenga de Twilio
        # ------------------------------------------------------------
        signature = request.headers.get("X-Twilio-Signature", "")

        if not self.validator.validate(
            self.webhook_url,
            data,
            signature,
        ):
            print("Webhook con firma inválida")
            return HttpResponseForbidden("Invalid Twilio Signature")

        # ------------------------------------------------------------
        # Reenviar el webhook al servicio del puerto 2880
        # ------------------------------------------------------------
        try:
            session = requests.Session()
            session.trust_env = False

            session.post(
                self.FORWARD_URL,
                data=raw_body,
                headers={
                    "Content-Type": request.headers.get(
                        "Content-Type",
                        "application/x-www-form-urlencoded"
                    )
                },
                timeout=5,
            )

        except Exception as e:
            print(f"Error reenviando webhook a 2880: {e}")

        # ============================================================
        # CAMBIO DE ESTADO DE UN MENSAJE
        # ============================================================
        if data.get("MessageStatus"):
            procesar_estado_mensaje(data)

        # ============================================================
        # RESPUESTA A BOTÓN
        # ============================================================
        elif data.get("MessageType") == "button":

            original_sid = data.get("OriginalRepliedMessageSid")
            button_payload = data.get("ButtonPayload")
            from_number = data.get("From")

            try:
                mensaje = (
                    Mensaje.objects
                    .select_for_update()
                    .select_related("turno")
                    .get(id_mensaje=original_sid)
                )

                turno = mensaje.turno

                if turno.estado_paciente_id == 4:

                    turno.estado_paciente_id = int(button_payload)
                    turno.fecha_estado_paciente = timezone.now()

                    turno.save(update_fields=[
                        "estado_paciente_id",
                        "fecha_estado_paciente",
                    ])

                    sendMessage(
                        "Gracias por su respuesta",
                        from_number,
                    )

                    if int(button_payload) == 2:
                        lista_espera_look(turno)
                        liberar_turno(turno.id_sisr)

            except Mensaje.DoesNotExist:
                print(f"No existe mensaje con SID {original_sid}")

            except Exception:
                import traceback
                traceback.print_exc()
                raise

        # ============================================================
        # MENSAJE ENTRANTE NORMAL
        # ============================================================
        else:
            from_number = data.get("From")
            body = data.get("Body")

            print(f"Mensaje recibido de {from_number}: {body}")

        return HttpResponse(status=200)
