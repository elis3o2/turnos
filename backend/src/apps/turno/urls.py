from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurnoViewSet, EstadoTurnoViewSet, TurnoPacienteView

router = DefaultRouter()
router.register('turnos', TurnoViewSet, basename='turno')
router.register('estado_turno', EstadoTurnoViewSet, basename='estado_turno')

urlpatterns = [
    path('', include(router.urls)),
    path('turno-paciente/', TurnoPacienteView.as_view(), name='turno-paciente')
]


