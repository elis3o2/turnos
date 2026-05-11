import http from '../../common/api/client'
import type { Plantilla, EfeSerEspPlantilla, EfeSerEspPlantillaExtend, MensajeCount} from './types'


export const getPlantillas = (): Promise<Plantilla[]> =>
	http.get<Plantilla[]>(`mensaje/plantilla/`).then(res => res.data);


export const getPlantillaById = (id: number): Promise<Plantilla> =>
  http.get<Plantilla>(`mensaje/plantilla/${id}/`).then(res => res.data);


export const getPlantillaByTipo = (id: number): Promise<Plantilla[]> =>
  http.get<Plantilla[]>(`mensaje/plantilla/?id_tipo=${id}`).then(res => res.data);

export const getPlantillaByEfector = (id: number): Promise<EfeSerEspPlantilla[]> =>
  http.get<EfeSerEspPlantilla[]>(`mensaje/efe_ser_esp_plantilla/buscar/?id_efector=${id}`).then(res => res.data);


export const updateEfectorPlantilla = (id: number, data: any): Promise<EfeSerEspPlantillaExtend> =>
  http.patch<EfeSerEspPlantillaExtend>(`mensaje/efe_ser_esp_plantilla/${id}/`, data).then(res => res.data);

export const getPlantillaByEfectorServicio = (id_e: number, id_s: number): Promise<EfeSerEspPlantillaExtend[]> =>
  http.get<EfeSerEspPlantillaExtend[]>(`mensaje/efe_ser_esp_plantilla/detalle/?id_efector=${id_e}&id_servicio=${id_s}`).then(res => res.data);


export const getEfeSerEspPlantillaAll = (): Promise<EfeSerEspPlantillaExtend[]> => 
  http.get<EfeSerEspPlantillaExtend[]>(`mensaje/efe_ser_esp_plantilla/buscar`).then(res => res.data); 

export const getMensajesCount = (ids_efe: number[], ids_ser: number[], ids_esp: number[], fecha_desde: string | null, fecha_hasta: string | null) : Promise<MensajeCount> =>
  http.get<MensajeCount>(`mensaje/mensajes/count/`,{params: {ids_efe, ids_ser, ids_esp, fecha_desde, fecha_hasta}}).then(res => res.data);
