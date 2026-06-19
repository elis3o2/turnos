// ── Helpers de fecha ──────────────────────────────────────────────────────────

const toDateString = (date: Date): string => date.toISOString().split('T')[0]

export const getDefaultDesde = (): string => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return toDateString(d)
}

// ─────────────────────────────────────────────
// COLORES POR ESTADO
// ─────────────────────────────────────────────


export const ACTUALIZACIONES = [
  {
    titulo: "Página de inicio",
    detalle:
      "Se muestra la cantidad de mensajes enviados y el estado de los mensajes de recordatorio. Al hacer clic sobre el cuadro de color se pueden ver los estados de los turnos asociados.",
  },
  {
    titulo: "Página de turnos",
    detalle:
      "En ciertos efectores, los mensajes de recordatorio incluyen un link donde el paciente puede confirmar, rechazar o indicar número incorrecto. Si el turno se rechaza, se libera en SISR. Si estaba en lista de espera, se vuelve a agregar. Además, se puede filtrar por: Confirmado · Rechazado · Sin Respuesta · Sin Datos.",
  },
  {
    titulo: "Página de lista de espera",
    detalle:
      'Cuando se asigna un turno en SISR que coincide con uno en lista de espera (efector, servicio, especialidad y persona), se quita automáticamente. Nueva vista de detalle de turno. Al agregar un turno, aparece el botón "Agregar Otro" que precarga el efector, la persona y el médico solicitante.',
  },
  {
    titulo: "Cambio en la navegación",
    detalle:
      "Para moverse entre pantallas se debe usar el botón de menú (☰) en la esquina superior izquierda, que despliega las opciones de navegación.",
  },
];