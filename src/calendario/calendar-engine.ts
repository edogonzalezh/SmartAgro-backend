// calendar-engine.ts
// Lógica de dominio pura del motor de calendario. Sin dependencias de NestJS ni Prisma.
// Esto es lo que permite testearlo aislado y moverlo a otro servicio en el futuro sin reescribirlo.

export interface EtapaDefinicion {
  codigo: string;
  nombre: string;
  orden: number;
  duracionDesdeAnterior: number; // días
}

export interface TareaDefinicion {
  nombre: string;
  etapaAncla: string; // código de EtapaDefinicion
  offsetDias: number;
}

export interface FichaCultivo {
  id: string;
  nombre: string;
  etapas: EtapaDefinicion[];
  tareas: TareaDefinicion[];
}

export interface EtapaInstancia {
  codigo: string;
  nombre: string;
  fechaPlanificada: Date;
  fechaReal: Date | null;
}

export interface TareaInstancia {
  nombre: string;
  etapaAncla: string;
  offsetDias: number;
  fechaPlanificada: Date;
}

export interface CalendarioLote {
  fichaId: string;
  etapas: Record<string, EtapaInstancia>;
  tareas: TareaInstancia[];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Genera el calendario inicial completo a partir de la ficha técnica y la fecha de siembra.
 */
export function generarCalendario(ficha: FichaCultivo, fechaSiembra: Date): CalendarioLote {
  const etapasOrdenadas = [...ficha.etapas].sort((a, b) => a.orden - b.orden);
  const etapas: Record<string, EtapaInstancia> = {};
  let fechaAcumulada = new Date(fechaSiembra);

  for (const etapaDef of etapasOrdenadas) {
    fechaAcumulada = addDays(fechaAcumulada, etapaDef.duracionDesdeAnterior);
    etapas[etapaDef.codigo] = {
      codigo: etapaDef.codigo,
      nombre: etapaDef.nombre,
      fechaPlanificada: new Date(fechaAcumulada),
      fechaReal: null,
    };
  }

  const tareas: TareaInstancia[] = ficha.tareas.map((t) => ({
    nombre: t.nombre,
    etapaAncla: t.etapaAncla,
    offsetDias: t.offsetDias,
    fechaPlanificada: addDays(etapas[t.etapaAncla].fechaPlanificada, t.offsetDias),
  }));

  return { fichaId: ficha.id, etapas, tareas };
}

/**
 * Confirma la fecha real de una etapa y recalcula en cadena todo lo que viene después
 * (etapas sin fecha real aún, y todas las tareas ancladas a etapas desplazadas).
 * No muta el calendario original: devuelve uno nuevo.
 */
export function confirmarEtapaReal(
  ficha: FichaCultivo,
  calendario: CalendarioLote,
  etapaCodigo: string,
  fechaReal: Date,
): { calendario: CalendarioLote; diffDiasAplicado: number } {
  const ordenEtapas = [...ficha.etapas].sort((a, b) => a.orden - b.orden).map((e) => e.codigo);
  const idx = ordenEtapas.indexOf(etapaCodigo);
  if (idx === -1) throw new Error(`Etapa desconocida: ${etapaCodigo}`);

  // Clonar para no mutar el original
  const nuevasEtapas: Record<string, EtapaInstancia> = Object.fromEntries(
    Object.entries(calendario.etapas).map(([k, v]) => [k, { ...v }]),
  );

  const etapa = nuevasEtapas[etapaCodigo];
  const diffDias = Math.round(
    (fechaReal.getTime() - etapa.fechaPlanificada.getTime()) / (1000 * 60 * 60 * 24),
  );

  etapa.fechaReal = fechaReal;
  etapa.fechaPlanificada = fechaReal;

  for (let i = idx + 1; i < ordenEtapas.length; i++) {
    const siguienteCodigo = ordenEtapas[i];
    const siguiente = nuevasEtapas[siguienteCodigo];
    if (!siguiente.fechaReal) {
      siguiente.fechaPlanificada = addDays(siguiente.fechaPlanificada, diffDias);
    }
  }

  const nuevasTareas: TareaInstancia[] = ficha.tareas.map((t) => ({
    nombre: t.nombre,
    etapaAncla: t.etapaAncla,
    offsetDias: t.offsetDias,
    fechaPlanificada: addDays(nuevasEtapas[t.etapaAncla].fechaPlanificada, t.offsetDias),
  }));

  return {
    calendario: { fichaId: calendario.fichaId, etapas: nuevasEtapas, tareas: nuevasTareas },
    diffDiasAplicado: diffDias,
  };
}

/**
 * Sugiere un ajuste por evento climático, sin aplicarlo. La confirmación queda a cargo
 * del agricultor a través de confirmarEtapaReal o de un endpoint dedicado en el futuro.
 */
export function sugerirAjustePorClima(tipo: "helada" | "ola_calor"): number {
  if (tipo === "helada") return 7; // sugerencia media del rango 5-10 días
  if (tipo === "ola_calor") return -5;
  return 0;
}
