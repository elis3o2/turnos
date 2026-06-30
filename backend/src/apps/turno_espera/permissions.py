from rest_framework.permissions import BasePermission,  SAFE_METHODS
from src.permissions import is_espera
from src.apps.efector.models import Deriva, EfeSerEsp

class TurnoEsperaCreatePermission(BasePermission):
    message = "No tiene permisos para crear el turno o no existe una derivación válida."

    def _efectores_usuario(self, request):
        return set(request.user.efectores.values_list("id", flat=True))

    def has_permission(self, request, view):
        if not is_espera(request.user):
            return False

        id_efector_solicitante = request.data.get("id_efector_solicitante")
        id_efe_ser_esp = request.data.get("id_efe_ser_esp")
        cupo = request.data.get("cupo")

        if id_efector_solicitante is None or id_efe_ser_esp is None or cupo is None:
            return False

        try:
            id_efector_solicitante = int(id_efector_solicitante)
            id_efe_ser_esp = int(id_efe_ser_esp)
            cupo = int(cupo)
        except (TypeError, ValueError):
            return False

        if id_efector_solicitante not in self._efectores_usuario(request):
            return False

        return ( EfeSerEsp.objects.filter(
                    id=id_efe_ser_esp,
                    efector_id=id_efector_solicitante,
                ).exists()
            or Deriva.objects.filter(
                efector_id=id_efector_solicitante,
                efe_ser_esp_deriva_id=id_efe_ser_esp,
                cupo=bool(cupo),
            ).exists())

class TurnoEsperaUpdatePermission(BasePermission):

    message = "No tiene permisos para modificar o cerrar este turno."

    def _efectores_usuario(self, request):
        return set(request.user.efectores.values_list("id", flat=True))

    def has_permission(self, request, view):
        return is_espera(request.user)

    def has_object_permission(self, request, view, obj):

        efectores_usuario = self._efectores_usuario(request)
        efector_turno = obj.efe_ser_esp.efector.id
        efector_solicitante = obj.efector_solicitante.id
        cupo = obj.cupo

        # 🔹 CERRAR TURNO
        if view.action == "close_turno" and cupo:
            return efector_solicitante in efectores_usuario
        
        if view.action == "close_turno":
            return efector_turno in efectores_usuario

        # 🔹 MARCAR ESTUDIOS
        if view.action == "marcar_estudios":
            # lógica típica: puede actuar si pertenece al efector del turno
            # o al efector solicitante (ajustalo según tu negocio)
            return (
                efector_turno in efectores_usuario
                or efector_solicitante in efectores_usuario
            )

        return False

class TurnoEsperaReadPermission(BasePermission):

    message = "No tiene permisos para ver este turno."

    def _efectores_usuario(self, request):
        return set(request.user.efectores.values_list("id", flat=True))

    def has_permission(self, request, view):
        # solo permitir métodos de lectura
        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):

        efectores_usuario = self._efectores_usuario(request)

        efector_turno = obj.efe_ser_esp.efector.id
        efector_solicitante = obj.efector_solicitante.id
        cupo = obj.cupo

        # caso cupo reservado
        if cupo and efector_solicitante in efectores_usuario:
            return True

        # caso cupo institucional
        if not cupo and efector_turno in efectores_usuario:
            return True

        return False