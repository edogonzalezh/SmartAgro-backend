// calendario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FichaCultivo,
  generarCalendario,
  confirmarEtapaReal,
  sugerirAjustePorClima,
} from './calendar-engine';

@Injectable()
export class CalendarioService {
  constructor(private prisma: PrismaService) {}

  /** Carga una FichaCultivo desde la base de datos y la convierte al formato del motor. */
  private async cargarFicha(fichaId: string): Promise<FichaCultivo> {
    const ficha = await this.prisma.fichaCultivo.findUnique({
      where: { id: fichaId },
      include: { etapas: true, tareas: true },
    });
    if (!ficha) throw new NotFoundException(`Ficha no encontrada: ${fichaId}`);

    return {
      id: ficha.id,
      nombre: ficha.nombre,
      etapas: ficha.etapas.map((e) => ({
        codigo: e.etapaCodigo,
        nombre: e.nombre,
        orden: e.orden,
        duracionDesdeAnterior: e.duracionDesdeAnterior,
      })),
      tareas: ficha.tareas.map((t) => ({
        nombre: t.nombre,
        etapaAncla: t.etapaAncla,
        offsetDias: t.offsetDias,
      })),
    };
  }

  /** Crea un lote y genera + persiste su calendario inicial. */
  async crearLoteConCalendario(params: {
    nombre: string;
    predioId: string;
    fichaId: string;
    fechaInicio: Date;
  }) {
    const ficha = await this.cargarFicha(params.fichaId);
    const calendario = generarCalendario(ficha, params.fechaInicio);

    const lote = await this.prisma.lote.create({
      data: {
        nombre: params.nombre,
        predioId: params.predioId,
        fichaId: params.fichaId,
        fechaInicio: params.fechaInicio,
        etapas: {
          create: Object.values(calendario.etapas).map((e) => ({
            etapaCodigo: e.codigo,
            nombre: e.nombre,
            fechaPlanificada: e.fechaPlanificada,
            fechaReal: e.fechaReal,
          })),
        },
      },
      include: { etapas: true },
    });

    return lote;
  }

  /** Confirma la fecha real de una etapa y persiste el recálculo de todo lo posterior. */
  async confirmarEtapa(loteId: string, etapaCodigo: string, fechaReal: Date) {
    const loteDb = await this.prisma.lote.findUnique({
      where: { id: loteId },
      include: { etapas: true },
    });
    if (!loteDb) throw new NotFoundException(`Lote no encontrado: ${loteId}`);

    const ficha = await this.cargarFicha(loteDb.fichaId);

    const calendarioActual = {
      fichaId: loteDb.fichaId,
      etapas: Object.fromEntries(
        loteDb.etapas.map((e) => [
          e.etapaCodigo,
          {
            codigo: e.etapaCodigo,
            nombre: e.nombre,
            fechaPlanificada: e.fechaPlanificada,
            fechaReal: e.fechaReal,
          },
        ]),
      ),
      tareas: [], // las tareas se recalculan completas, no hace falta cargarlas
    };

    const { calendario, diffDiasAplicado } = confirmarEtapaReal(
      ficha,
      calendarioActual,
      etapaCodigo,
      fechaReal,
    );

    // Persistir cada etapa actualizada
    await Promise.all(
      Object.values(calendario.etapas).map((e) =>
        this.prisma.etapaLote.updateMany({
          where: { loteId, etapaCodigo: e.codigo },
          data: {
            fechaPlanificada: e.fechaPlanificada,
            fechaReal: e.fechaReal,
            confirmadaEn: e.fechaReal ? new Date() : null,
          },
        }),
      ),
    );

    return { diffDiasAplicado, calendario };
  }

  /** Lista todos los lotes con sus etapas, para alimentar las pantallas de "hoy" y calendario. */
  async listarLotes() {
    const lotes = await this.prisma.lote.findMany({
      include: {
        etapas: true,
        ficha: { include: { tareas: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular tareas por lote a partir de TareaFicha + fechas reales de EtapaLote
    return lotes.map((lote) => {
      const etapaMap = new Map(lote.etapas.map((e) => [e.etapaCodigo, e]));
      const tareas = lote.ficha.tareas.map((t) => {
        const ancla = etapaMap.get(t.etapaAncla);
        const fechaAncla = ancla
          ? (ancla.fechaReal ?? ancla.fechaPlanificada)
          : new Date();
        const fecha = new Date(fechaAncla);
        fecha.setDate(fecha.getDate() + t.offsetDias);
        return {
          id: t.id,
          nombre: t.nombre,
          etapaAncla: t.etapaAncla,
          offsetDias: t.offsetDias,
          fechaPlanificada: fecha,
        };
      });
      return { ...lote, tareas };
    });
  }

  /** Registra un evento climático y devuelve el ajuste sugerido (sin aplicarlo). */
  async registrarEventoClimatico(loteId: string, tipo: 'helada' | 'ola_calor', fecha: Date) {
    const ajusteSugeridoDias = sugerirAjustePorClima(tipo);
    const evento = await this.prisma.eventoClimatico.create({
      data: { loteId, tipo, fecha, ajusteSugeridoDias },
    });
    return evento;
  }
}
