def enviar_whatsapp(numero: str, mensaje: str) -> Response:

    sesion = (
        Mensaje.objects
        .filter(numero=numero)
        .exclude(sesion_id__isnull=True)
        .order_by("-fecha_envio")
        .values_list("sesion_id", flat=True)
        .first()
    )

    return _enviar_whatsapp(numero, mensaje, sesion)



def _enviar_whatsapp(numero: str, mensaje: str, sesion: str | None) -> Response:
    """
    Envía el mensaje al número usando la sesión indicada.
    """

    api_url = config('API_WHATSAPP')

    payload = {
        "numero": numero,
        "texto": mensaje,
    }

    if sesion:
        payload["session"] = sesion

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.post(
            api_url,
            json=payload,
            headers=headers,
            timeout=15
        )

        if "application/json" in response.headers.get("Content-Type", ""):
            return Response(response.json(), status=response.status_code)

        return Response(
            {"detail": "Mensaje enviado pero respuesta no JSON"},
            status=response.status_code
        )

    except requests.exceptions.RequestException as e:
        return Response(
            {
                "error": "No se pudo conectar con la API WhatsApp",
                "detail": str(e)
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )



def decode_res(res: dict) -> (str, int, datetime, str):
    response_data = getattr(res, "data", {}) 
    code = response_data.get("code", {})
    envio_id = None
    ins = None
    ack = None
    if code == 0:
        envio_id = response_data.get("id")
        ack = response_data.get("ack")
        fecha = response_data.get("time")
        ins = response_data.get("session")
    else:
        fecha = timezone.now()
        if code == -1:
            ack = -4
        elif code == -2:
            ack = -3
        elif code == -3:
            ack = -2
        else:
            ack = -5
    
    return (envio_id, ack, fecha, ins)

    
def check_turno(efe_ser_esp: int, estado: int) -> (bool, Plantilla | None):
    """
    Revisa si el efe_ser_esp tiene la bandera del estado encendida y si es asi
    devuelve la Plantilla asociada
    """
    try:
        turno = EfeSerEspPlantilla.objects.filter(
            id_efe_ser_esp=efe_ser_esp,
        ).first()
        
        if not turno:
            return False, None
        
        # Mapear estado → tipo y campo de plantilla
        mapping = {
            1: ("confirmacion", "plantilla_asig"),
            2: ("cancelacion", "plantilla_canc"),
            3: ("reprogramacion", "plantilla_repr"),
        }
        
        tipo, campo_plantilla = mapping.get(estado, ("recordatorio", "plantilla_reco"))
        
        # Chequear si el flag booleano del tipo está activo
        if getattr(turno, tipo) == 1:  
            plantilla = getattr(turno, campo_plantilla)
            if plantilla:
                plantilla.contenido = emoji.emojize(plantilla.contenido)
            return True, plantilla

        
        return False, None
    
    except Exception as e:
        print(f"Error en check_turno: {e}")
        return False, None

def map_estdo(est: int) -> int:
    if est == 3:
        estado = 1
    elif est in (4, 5, 6):
        estado = 4
    elif est in (1, 2, 7):
        estado = 2
    elif est == 8:
        estado = 3
    return estado