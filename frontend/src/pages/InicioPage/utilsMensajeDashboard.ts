// ─────────────────────────────────────────────
// COLORES POR ESTADO
// ─────────────────────────────────────────────

export const ESTADO_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  enviado:    { bg: '#e3f2fd', color: '#0d47a1', border: '#90caf9' },
  entregado:  { bg: '#e8f5e9', color: '#1b5e20', border: '#a5d6a7' },
  leído:      { bg: '#f3e5f5', color: '#4a148c', border: '#ce93d8' },
  fallido:    { bg: '#ffebee', color: '#b71c1c', border: '#ef9a9a' },
  pendiente:  { bg: '#fff8e1', color: '#e65100', border: '#ffe082' },
}

export const DEFAULT_ESTADO_COLOR = { bg: '#f5f5f5', color: '#424242', border: '#e0e0e0' }


