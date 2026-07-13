from django.urls import path, include, re_path
from django.views.generic import TemplateView # O tu vista 'frontend'

urlpatterns = [
    path("turnos/api/", include("src.urls")),

]