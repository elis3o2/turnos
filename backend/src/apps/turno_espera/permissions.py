from rest_framework.permissions import BasePermission,  SAFE_METHODS
from src.permissions import is_administrativo

class TurnoEsperaCreatePermission(BasePermission):

    message = "No tiene permisos para crear el turno."

    def _efectores_usuario(self, request):
        return set(request.user.efectores.values_list("id", flat=True))

    def has_permission(self, request, view):

        if not is_administrativo(request.user):
            return False

        id_efector_solicitante = request.data.get("id_efector_solicitante")
        if not id_efector_solicitante:
            return False

        return int(id_efector_solicitante) in self._efectores_usuario(request)



class TurnoEsperaUpdatePermission(BasePermission):

    message = "No tiene permisos para modificar o cerrar este turno."

    def _efectores_usuario(self, request):
        return set(request.user.efectores.values_list("id", flat=True))

    def has_permission(self, request, view):
        return True  # validamos a nivel objeto

    def has_object_permission(self, request, view, obj):

        efectores_usuario = self._efectores_usuario(request)

        efector_turno = obj.efe_ser_esp.efector.id
        efector_solicitante = obj.efector_solicitante.id
        cupo = obj.cupo

        # 🔹 CERRAR TURNO
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