from rest_framework.permissions import BasePermission
from src.permissions import is_administrativo

class TurnoEsperaCreateUpdatePermission(BasePermission):

    message = "No tiene permisos para realizar esta operación."

    def _efectores_usuario(self, request):
        return set(request.user.efectores.values_list("id", flat=True))

    def has_permission(self, request, view):

        # solo nos interesa controlar CREATE
        if request.method != "POST":
            return True

        if not is_administrativo(self.user):
            return False

        efector_solicitante = request.data.get("efector_solicitante")

        if not efector_solicitante:
            return False

        return int(efector_solicitante) in self._efectores_usuario(request)

    def has_object_permission(self, request, view, obj):

        if request.method not in ["PUT", "PATCH"]:
            return True

        efectores_usuario = self._efectores_usuario(request)

        efector_turno = obj.efe_ser_esp.efector.id
        efector_solicitante = obj.efector_solicitante.id
        cupo = obj.cupo

        # caso 1
        if not cupo and efector_turno in efectores_usuario:
            return True

        # caso 2
        if cupo and efector_solicitante in efectores_usuario:
            return True

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