from rest_framework import viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import CustomTokenObtainPairSerializer


import logging
logger = logging.getLogger(__name__)


        

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




