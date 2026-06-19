export const TIPO_TO_ID: Record<string, number> = {
  asignacion:    1,
  cancelacion:   2,
  reprogramacion:3,
  recordatorio:  4,
};

export const ID_TO_TIPO_KEY: Record<number, string> = {
  1: 'asignacion',
  2: 'cancelacion',
  3: 'reprogramacion',
  4: 'recordatorio',
};

export const TIPO_TO_CAMPO: Record<string, string> = {
  asignacion:    'plantilla_asig',
  cancelacion:   'plantilla_canc',
  reprogramacion:'plantilla_repr',
  recordatorio:  'plantilla_reco',
};

export const TIPO_TO_LABEL: Record<string, string> = {
  asignacion:    'Confirmación',
  reprogramacion:'Reprogramación',
  cancelacion:   'Cancelación',
  recordatorio:  'Recordatorio',
};

export const TIPO_TO_COLOR: Record<string, string> = {
  asignacion:    '#4caf50',
  reprogramacion:'#1976d2',
  cancelacion:   '#e53935',
  recordatorio:  '#fbc02d',
};

export const TIPO_KEYS = Object.keys(TIPO_TO_LABEL);



export const ESTADO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "SERVER ERROR": { bg: '#ffebee', color: '#b71c1c', border: '#ef9a9a' },

  "FALTAN DATOS": { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' },

  "NUMERO INVALIDO": { bg: '#f3e5f5', color: '#6a1b9a', border: '#ce93d8' },

  "SIN WHATSAPP": { bg: '#eceff1', color: '#37474f', border: '#b0bec5' }, // gris neutro

  "FALLIDO": { bg: '#ede7f6', color: '#4527a0', border: '#b39ddb' },

  "PENDIENTE": { bg: '#fff8e1', color: '#e65100', border: '#ffe082' }, // amarillo

  "ENVIADO": { bg: '#e0f2f1', color: '#004d40', border: '#80cbc4' },

  "RECIBIDO": { bg: '#e8f5e9', color: '#1b5e20', border: '#a5d6a7' },

  "LEIDO": { bg: '#e3f2fd', color: '#0d47a1', border: '#90caf9' },
};

export const DEFAULT_ESTADO_COLOR = { bg: '#f5f5f5', color: '#424242', border: '#e0e0e0' }


