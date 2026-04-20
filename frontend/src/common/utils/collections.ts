export const sortByNombre = <T extends { nombre: string }>(arr: T[]): T[] =>
  [...arr].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

export const mergeById = <T extends { id: number }>(a: T[], b: T[]): T[] =>
  Array.from(new Map([...a, ...b].map((x) => [x.id, x])).values());