from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_espera(user):
    return user.groups.filter(name="espera").exists()

def is_configuracion(user):
    return user.groups.filter(name="configuracion").exists()


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




class OnlyEsperaPostUpdatePermission(BasePermission):
    """
    Permite crear o modificar solo a usuarios que
    pertenecen al grupo 'espera'.
    """

    message = "Solo los usuarios del grupo 'espera' pueden crear o modificar."

    def has_permission(self, request, view):

        # permitir lecturas
        if request.method in SAFE_METHODS:
            return True

        # verificar grupo
        return is_espera(request.user)


class OnlyConfiguracionUpdatePermission(BasePermission):
    """
    Permite modificar solo a usuarios que 
    pertenecen al grupo 'configuracion'. No permite crear.
    """

    def has_permission(self, request, view):
        if request.method == "POST":
            return False

        if request.method in SAFE_METHODS:
            return True

        return is_configuracion(request.user)