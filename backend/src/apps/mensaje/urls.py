from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstadoMsjViewSet, MensajeViewSet, EfeSerEspPlantillaViewSet, PlantillaViewSet

router = DefaultRouter()
router.register('estado_msj', EstadoMsjViewSet, basename='estado_msj')
router.register('mensajes', MensajeViewSet, basename='mensaje')
router.register('plantilla', PlantillaViewSet, basename='plantilla')
router.register('efe_ser_esp_plantilla', EfeSerEspPlantillaViewSet, basename='efe_ser_esp_plantilla')


urlpatterns = [
    path('', include(router.urls)),
]