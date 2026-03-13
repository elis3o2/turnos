from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_administrativo(user):
    return user.groups.filter(name="administrativo").exists()


class ReadOnly(BasePermission):

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


class OnlyAdmCreatetUpdatePermission(BasePermission):
    """
    Permite crear o modificar solo a usuarios que
    pertenecen al grupo 'lista_espera'.
    """

    message = "Solo los usuarios del grupo 'administivo' pueden crear o modificar."

    def has_permission(self, request, view):

        # permitir lecturas
        if request.method in SAFE_METHODS:
            return True

        # verificar grupo
        return is_administrativo(request.user)

