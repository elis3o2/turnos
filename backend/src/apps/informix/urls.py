from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (TurnosMergedAllAPIView, TurnosRespuestaAPIView,GetIncorrectoAPIView,
                GetPacienteAPIView, GetProfesionalAPIView, HistoricoPaciente)


urlpatterns = [
    path('turnos-merged-all-list/', TurnosMergedAllAPIView.as_view(), name='turnos-merged-all'),
    path('turnos-merged-respuesta/', TurnosRespuestaAPIView.as_view(), name='turnos-merged-respuesta'), 
    path('turnos-merged-error/', GetIncorrectoAPIView.as_view(), name='turnos-merged-error'), 
    path('get_paciente/', GetPacienteAPIView.as_view(), name='get_paciente'),
    path('get_profesional/', GetProfesionalAPIView.as_view(), name='get_profesional'),
    path('get_historico/', HistoricoPaciente.as_view(), name='get_historico'),
]    
    
