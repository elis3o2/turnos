from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EfectorViewSet, EspecialidadViewSet, ServicioViwSet, EfeSerEspViewSet

router = DefaultRouter()
router.register('efectores', EfectorViewSet, basename='efector')
router.register('especialidades', EspecialidadViewSet, basename='especialidad')
router.register('servicios', ServicioViwSet, basename='servicio')
router.register('efe_ser_esp', EfeSerEspViewSet, basename='efe_ser_esp')

urlpatterns = [
    path('', include(router.urls)),
]