from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from src.models import Efector

User = get_user_model()

def crear_usuario(username, password, dni, efector_id):
    efector = Efector.objects.get(pk=efector_id)
    user = User.objects.create_user(
        username=username,
        password=password,
        dni=dni,
    )
    user.efectores.set([efector])
    grupo, _ = Group.objects.get_or_create(name='administrativo')
    user.groups.add(grupo)
    return user


crear_usuario('dunant', 'dunant', 'dunant',  23)
crear_usuario('ugarte', 'ugarte', 'ugarte', 102)
crear_usuario('duarte', 'duarte', 'duarte', 64)
crear_usuario('santalucia', 'santalucia', 'santalucia', 65)
crear_usuario('rosello', 'rosello', 'rosello', 29)
crear_usuario('azurduy', 'azurduy', 'azurduy', 63)
crear_usuario('emaus', 'emaus', 'emaus', 25)
crear_usuario('coulin', 'coulin', 'coulin', 14)
crear_usuario('ceferino', 'ceferino', 'ceferino', 19)
