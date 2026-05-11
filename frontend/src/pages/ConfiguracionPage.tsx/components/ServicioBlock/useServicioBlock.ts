import { useMemo } from "react";
import type { Servicio, Efector } from"../../../../features/efector/types";
import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import { getPlantillaByEfectorServicio } from "../../../../features/mensaje/api";
import type { Setter, AlertSeverity } from "../../../../common/types";

type Props = {
  efectorSeleccionado: Efector[];
  servicios: Servicio[];
  servicioSeleccionado: Servicio[];
  setServicioSeleccionado: Setter<Servicio[]>;
  especialidades: EfeSerEspPlantillaExtend[];
  setEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  efecServEspecialidades: Record<number, Record<number, EfeSerEspPlantillaExtend[]>>;
  setEfecServEspecialidades: Setter<Record<number, Record<number, EfeSerEspPlantillaExtend[]>>>;
  servicioEfectorActual: Record<number, number[]>;
  setAlertOpen: Setter<boolean>;
  setAlertMsg: Setter<string>;
  setAlertSeverity: Setter<AlertSeverity>;
};

export const useServicioBlock = (props: Props) => {
  const {
    efectorSeleccionado,
    servicios,
    servicioSeleccionado,
    setServicioSeleccionado,
    setEspecialidades,
    efecServEspecialidades,
    setEfecServEspecialidades,
    servicioEfectorActual,
    setAlertOpen,
    setAlertMsg,
    setAlertSeverity,
  } = props;

  const selectedEfIds = useMemo(
    () => new Set(efectorSeleccionado.map(e => e.id)),
    [efectorSeleccionado]
  );

  const allEspecialidadesToChange = async (): Promise<EfeSerEspPlantillaExtend[]> => {
    if (efectorSeleccionado.length === 0 || servicios.length === 0) return [];

    const listaMap = new Map<number, EfeSerEspPlantillaExtend>();

    for (const serv of servicios) {
      const servId = serv.id;
      const efIds = (servicioEfectorActual[servId] ?? []).filter(id => selectedEfIds.has(id));

      for (const efId of efIds) {
        const cached = efecServEspecialidades?.[efId]?.[servId];
        if (cached) {
          cached.forEach(es => listaMap.set(es.id, es));
        } else {
          try {
            const data = await getPlantillaByEfectorServicio(efId, servId);

            setEfecServEspecialidades(prev => ({
              ...prev,
              [efId]: {
                ...(prev[efId] || {}),
                [servId]: data,
              },
            }));

            data.forEach(es => listaMap.set(es.id, es));
          } catch {
            setAlertMsg("Error cargando especialidades");
            setAlertSeverity("warning");
            setAlertOpen(true);
          }
        }
      }
    }

    return Array.from(listaMap.values());
  };

  const handleServicioClick = async (servicio: Servicio) => {
    if (efectorSeleccionado.length === 0) return;

    if (servicioSeleccionado.some(s => s.id === servicio.id)) {
      setEspecialidades(prev => prev.filter(es => es.id_servicio !== servicio.id));
      setServicioSeleccionado(prev => prev.filter(s => s.id !== servicio.id));
      return;
    }

    const servId = servicio.id;
    const efIds = (servicioEfectorActual[servId] ?? []).filter(id => selectedEfIds.has(id));

    let nuevas: EfeSerEspPlantillaExtend[] = [];

    for (const efId of efIds) {
      const cached = efecServEspecialidades?.[efId]?.[servId];

      if (cached) {
        nuevas.push(...cached);
      } else {
        try {
          const data = await getPlantillaByEfectorServicio(efId, servId);

          setEfecServEspecialidades(prev => ({
            ...prev,
            [efId]: {
              ...(prev[efId] || {}),
              [servId]: data,
            },
          }));

          nuevas.push(...data);
        } catch {
          setAlertMsg("Error cargando especialidades");
          setAlertSeverity("error");
          setAlertOpen(true);
        }
      }
    }

    setEspecialidades(prev => [...prev, ...nuevas]);
    setServicioSeleccionado(prev => [...prev, servicio]);
  };

  return {
    handleServicioClick,
    allEspecialidadesToChange,
  };
};