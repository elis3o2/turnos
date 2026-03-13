from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurnoViewSet, EstadoTurnoViewSet

router.register('turnos', TurnoViewSet, basename='turno')
router.register('estado_turno', EstadoTurnoViewSet, basename='estado_turno')

urlpatterns = [
    path('', include(router.urls)),
]