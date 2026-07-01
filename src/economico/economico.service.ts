// economico/economico.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EconomicoService {
  constructor(private prisma: PrismaService) {}

  // ── Gastos ──────────────────────────────────────────────────────
  async registrarGasto(loteId: string, data: {
    categoria: string; descripcion: string;
    cantidad?: number; unidad?: string;
    monto: number; fecha: Date;
  }) {
    return this.prisma.gastoLote.create({ data: { loteId, ...data } });
  }

  async listarGastos(loteId: string) {
    return this.prisma.gastoLote.findMany({
      where: { loteId },
      orderBy: { fecha: 'desc' },
    });
  }

  async eliminarGasto(gastoId: string) {
    return this.prisma.gastoLote.delete({ where: { id: gastoId } });
  }

  // ── Ingresos ─────────────────────────────────────────────────────
  async registrarIngreso(loteId: string, data: {
    descripcion: string; cantidad?: number; unidad?: string;
    precioUnitario?: number; monto: number;
    fecha: Date; comprador?: string;
  }) {
    return this.prisma.ingresoLote.create({ data: { loteId, ...data } });
  }

  async listarIngresos(loteId: string) {
    return this.prisma.ingresoLote.findMany({
      where: { loteId },
      orderBy: { fecha: 'desc' },
    });
  }

  async eliminarIngreso(ingresoId: string) {
    return this.prisma.ingresoLote.delete({ where: { id: ingresoId } });
  }

  // ── Resumen financiero por lote ──────────────────────────────────
  async resumenLote(loteId: string) {
    const [gastos, ingresos, lote] = await Promise.all([
      this.prisma.gastoLote.findMany({ where: { loteId } }),
      this.prisma.ingresoLote.findMany({ where: { loteId } }),
      this.prisma.lote.findUnique({
        where: { id: loteId },
        include: { ficha: true, predio: true },
      }),
    ]);

    const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
    const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0);
    const margen = totalIngresos - totalGastos;
    const rentabilidad = totalGastos > 0 ? (margen / totalGastos) * 100 : 0;

    const gastosPorCategoria = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] ?? 0) + g.monto;
      return acc;
    }, {} as Record<string, number>);

    return {
      lote,
      totalGastos,
      totalIngresos,
      margen,
      rentabilidad: Math.round(rentabilidad * 10) / 10,
      gastosPorCategoria,
      gastos,
      ingresos,
    };
  }

  // ── Resumen global del agricultor ────────────────────────────────
  async resumenGlobal(usuarioId: string) {
    const lotes = await this.prisma.lote.findMany({
      where: { predio: { usuarioId } },
      include: {
        ficha: true,
        gastos: true,
        ingresos: true,
      },
    });

    return lotes.map(lote => {
      const totalGastos  = lote.gastos.reduce((s,g) => s+g.monto, 0);
      const totalIngresos = lote.ingresos.reduce((s,i) => s+i.monto, 0);
      const margen = totalIngresos - totalGastos;
      return {
        loteId: lote.id,
        loteNombre: lote.nombre,
        fichaNombre: lote.ficha.nombre,
        totalGastos,
        totalIngresos,
        margen,
      };
    });
  }
}
