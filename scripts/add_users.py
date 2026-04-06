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


crear_usuario('bazet', 'bazet', '4vaff', 39)
crear_usuario('flores', 'flores', 'fllo', 33)
crear_usuario('lepratti', 'lepratti', 'adsvds', 93)
crear_usuario('parquesur', 'parquesur', 'bfdcas', 42)
crear_usuario('sanmartina', 'sanmartina', 'dsvscx', 43)
crear_usuario('20dejunio', '20dejunio', 'dxcd', 40)
crear_usuario('mangrullo', 'mangrullo', 'vdc', 48)
crear_usuario('naranjo', 'naranjo', 'vsdc', 36)
crear_usuario('matheu', 'matheu', 'vsdfdfc', 37)
