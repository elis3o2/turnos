export const hasEspera = (groups?: string[] | null): boolean => {
  return groups?.includes("espera") ?? false;
};


export const hasConfiguracion = (groups?: string[] | null): boolean => {
  return groups?.includes("configuracion") ?? false;
};