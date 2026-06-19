import { useEffect, useMemo, useState } from "react";
import { getEstudioRequeridoAll } from "../../api";
import type { Estudio } from "../../types";
import { filterEstudios } from "../../utils";
import { getErrorMessage } from "@/common/utils/error";
import type { Setter } from "@/common/types";

interface Props {
  estudioRequerido: Estudio[];
  setEstudioRequerido: Setter<Estudio[]>;
  setFinishEstudioRequerido: Setter<boolean>;
}

export function useLookEstudioRequerido({
  estudioRequerido,
  setEstudioRequerido,
  setFinishEstudioRequerido,
}: Props) {
  const [estudios, setEstudios] = useState<Estudio[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(
    () => estudioRequerido?.map((e) => e.id) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getEstudioRequeridoAll();
        if (!mounted) return;

        setEstudios(data);
        setSelectedIds(estudioRequerido?.map((e) => e.id) ?? []);
      } catch (e: unknown) {
        setError(getErrorMessage(e, "Error al obtener estudios."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedIds(estudioRequerido?.map((e) => e.id) ?? []);
  }, [estudioRequerido]);

  const filtered = useMemo(
    () => filterEstudios(estudios, query),
    [estudios, query]
  );

  const handleConfirm = () => {
    const selectedObjects = estudios.filter((s) =>
      selectedIds.includes(s.id)
    );
    setEstudioRequerido(selectedObjects);
    setFinishEstudioRequerido(true);
  };

  const handleClear = () => {
    setSelectedIds([]);
    setEstudioRequerido([]);
    setFinishEstudioRequerido(false);
    setQuery("");
  };

  const toggleEstudio = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return {
    estudios,
    selectedIds,
    loading,
    error,
    query,
    setQuery,
    filtered,
    handleConfirm,
    handleClear,
    toggleEstudio,
  };
}