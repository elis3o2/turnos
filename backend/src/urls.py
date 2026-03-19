from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from src.views import (CustomTokenObtainPairView, SendWSP, TurnosMergedAllAPIView,
                        HistoricoPaciente, GetPacienteAPIView, GetProfesionalAPIView,
                        TurnosAlertasAPIView, GetIncorrectoAPIView)



# src/urls.py
urlpatterns = [
    # APIs
    path('turnos-merged-all-list/', TurnosMergedAllAPIView.as_view(), name='turnos-merged-all'),
    path('turnos-merged-alerta/', TurnosAlertasAPIView.as_view(), name='turnos-merged-alerta'), 
    path('turnos-merged-error/', GetIncorrectoAPIView.as_view(), name='turnos-merged-error'), 
    path('send_wsp/', SendWSP.as_view(), name='send_mensaje'),
    path('get_paciente/', GetPacienteAPIView.as_view(), name='get_paciente'),
    path('get_profesional/', GetProfesionalAPIView.as_view(), name='get_profesional'),
    path('get_historico/', HistoricoPaciente.as_view(), name='get_historico'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    path("turno/", include("src.apps.turno.urls")),
    path("turno_espera/", include("src.apps.turno_espera.urls")),
    path("efector/", include("src.apps.efector.urls")),
    path("mensaje/", include("src.apps.mensaje.urls"))

]
