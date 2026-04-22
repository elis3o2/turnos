export function formatFecha(fecha?: string): string {
  if (!fecha) return "-";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}-${mes}-${anio}`;
}

export function formatHora(hora?: string): string {
  if (!hora) return "-";
  return hora.slice(0, 5);
}