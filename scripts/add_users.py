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


crear_usuario('ferrandini', 'ferrandini',3333, 101 )
crear_usuario('martin', 'martin', 741474147, 96)