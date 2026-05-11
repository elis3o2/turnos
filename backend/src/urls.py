from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from src.views import CustomTokenObtainPairView, SendWSP, TokenObtainPairView



# src/urls.py
urlpatterns = [
    # APIs
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    path("turno/", include("src.apps.turno.urls")),
    path("turno_espera/", include("src.apps.turno_espera.urls")),
    path("efector/", include("src.apps.efector.urls")),
    path("mensaje/", include("src.apps.mensaje.urls")),
    path("informix/", include("src.apps.informix.urls"))

]
