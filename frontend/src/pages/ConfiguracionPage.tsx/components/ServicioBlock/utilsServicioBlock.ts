export const getEfIdsForService = (
  servicioId: number,
  servicioEfectorActual: Record<number, number[]>,
  selectedEfIds: Set<number>
) => {
  return (servicioEfectorActual[servicioId] ?? []).filter(id =>
    selectedEfIds.has(id)
  );
};