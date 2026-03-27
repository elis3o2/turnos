from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_administrativo(user):
    return user.groups.filter(name="administrativo").exists()

def is_agente(user):
    return user.groups.filter(name="agente").exists()


class ReadOnly(BasePermission):

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS



class EfectorPermission(BasePermission):
    """
    Permite acceso solo a objetos cuyo efector
    esté dentro de los efectores del usuario.
    La vista debe definir: efector_field
    """

    message = "No tiene permisos para acceder a este efector."

    def has_object_permission(self, request, view, obj):

        efector_field = getattr(view, "efector_field", None)

        if not efector_field:
            return True

        efector_obj = getattr(obj, efector_field)

        efectores_usuario = request.user.efectores.values_list("id", flat=True)

        return efector_obj.id in efectores_usuario




class OnlyAdmPostUpdatePermission(BasePermission):
    """
    Permite crear o modificar solo a usuarios que
    pertenecen al grupo 'administrativo'.
    """

    message = "Solo los usuarios del grupo 'administrativo' pueden crear o modificar."

    def has_permission(self, request, view):

        # permitir lecturas
        if request.method in SAFE_METHODS:
            return True

        # verificar grupo
        return is_administrativo(request.user)

