import type { Efector } from "../../features/efector/types";
import type { TurnoEspera, EstudioRequerido } from "../../features/turno_espera/types";

export type SortBy = "priority" | "dias";
export type AlertSeverity = "success" | "info" | "warning" | "error";

type DerivaLike = {
  efector_deriva: Efector;
};

export function getUniqueDerivaciones(data: DerivaLike[]): Efector[] {
  return Array.from(
    new Map(data.map((d) => [d.efector_deriva.id, d.efector_deriva])).values()
  );
}

export function buildEspecialidadesOptions(turnos: TurnoEspera[]) {
  const map = new Map<number, string>();

  for (const t of turnos) {
    if (!map.has(t.especialidad.id)) {
      map.set(t.especialidad.id, t.especialidad.nombre);
    }
  }

  return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
}

export function filterAndSortTurnos(
  turnos: TurnoEspera[],
  selectedEspecialidad: number | null,
  sortBy: SortBy
): TurnoEspera[] {
  let arr = [...turnos];

  if (selectedEspecialidad !== null) {
    arr = arr.filter((t) => t.especialidad.id === selectedEspecialidad);
  }

  if (sortBy === "priority") {
    arr.sort((a, b) => {
      const pa = a.prioridad ?? 99;
      const pb = b.prioridad ?? 99;

      if (pa !== pb) return pa - pb;

      return a.fecha_hora_creacion.localeCompare(b.fecha_hora_creacion);
    });
  } else {
    arr.sort((a, b) => {
      if (a.fecha_hora_creacion !== b.fecha_hora_creacion) {
        return a.fecha_hora_creacion.localeCompare(b.fecha_hora_creacion);
      }

      return (a.prioridad ?? 99) - (b.prioridad ?? 99);
    });
  }

  return arr;
}

export function getSelectedEstudiosFromTurno(activeTurno: TurnoEspera | null): number[] {
  if (!activeTurno?.estudios_requerido) return [];
  return activeTurno.estudios_requerido.filter((e) => e.estado).map((e) => e.id);
}

export function applyEstudiosToTurnos(
  turnos: TurnoEspera[],
  turnoId: number,
  updatedEstudios: any[]
): TurnoEspera[] {
  return turnos.map((t) => {
    if (t.id !== turnoId) return t;

    return {
      ...t,
      estudios_requerido: t.estudios_requerido.map((e) => {
        const updated = updatedEstudios.find((u) => u.id === e.id);
        return updated ? updated : e;
      }),
    };
  });
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;

  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return fallback;
}

export function toggleEstudioSelection(
  prev: number[],
  estudio: EstudioRequerido
): number[] {
  if (estudio.estado) return prev;

  return prev.includes(estudio.id)
    ? prev.filter((id) => id !== estudio.id)
    : [...prev, estudio.id];
}