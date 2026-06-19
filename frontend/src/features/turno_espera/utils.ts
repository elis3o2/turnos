import type { TurnoEspera, Estudio } from "./types";

export const mapPriorityNameId: Record<string, number> = { baja: 2, media: 1, alta: 0 };

export const mapPriorityIdName: Record<number, string> = { 2: "BAJA", 1: "MEDIA", 0: "ALTA" };


export function getDiasEnEsperaNumber(t: TurnoEspera): number {
  try {
    const fecha = new Date(t.fecha_hora_creacion);
    const fechaMid = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    ).getTime();

    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();

    const days = Math.floor((todayMid - fechaMid) / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  } catch {
    return 0;
  }
}


export const getPriorityColor = (p: number) => {
  if (p === 0) return "#EF4444";
  if (p === 1) return "#F59E0B";
  if (p === 2) return "#0baf26ff";
};



export function filterEstudios(
  estudios: Estudio[],
  query: string
): Estudio[] {
  const q = query.toLowerCase();


  return estudios.filter((e) =>
    [e.nombre, e.id?.toString()]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}