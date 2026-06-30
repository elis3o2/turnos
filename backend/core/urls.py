from django.urls import path, include, re_path
from django.views.generic import TemplateView # O tu vista 'frontend'
from src.views import CustomTokenObtainPairView

urlpatterns = [
    path("turnos/api/token/", CustomTokenObtainPairView.as_view()),
    path("turnos/api/", include("src.urls")),

]