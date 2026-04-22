from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstudioRequeridoViewSet, TurnoEsperaViewSet

router = DefaultRouter()
router.register('estudio_requerido', EstudioRequeridoViewSet, basename='estudio_requerido')
router.register('turno_espera', TurnoEsperaViewSet, basename='turno_espera')

urlpatterns = [
    path('', include(router.urls))
]