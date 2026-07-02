// asistente/asistente.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AsistenteService {
  constructor(private prisma: PrismaService) {}

  async construirContexto(usuarioId: string): Promise<string> {
    const hoy = new Date().toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    const predios = await this.prisma.predio.findMany({
      where: { usuarioId },
      include: {
        lotes: {
          include: {
            ficha: true,
            etapas: { orderBy: { fechaPlanificada: 'asc' } },
            gastos: true,
            ingresos: true,
          },
        },
      },
    });

    if (!predios.length) return `El agricultor no tiene predios ni lotes registrados aún.`;

    let ctx = `Hoy es ${hoy}. Zona: Talca, VII Región, Chile.\n\n`;

    for (const predio of predios) {
      ctx += `PREDIO: ${predio.nombre} (${predio.ubicacion})\n`;

      for (const lote of predio.lotes) {
        const etapasPendientes = lote.etapas.filter(e => !e.fechaReal);
        const etapasConfirmadas = lote.etapas.filter(e => e.fechaReal);
        const pct = lote.etapas.length ? Math.round(etapasConfirmadas.length / lote.etapas.length * 100) : 0;
        const totalGastos = lote.gastos.reduce((s,g) => s+g.monto, 0);
        const totalIngresos = lote.ingresos.reduce((s,i) => s+i.monto, 0);

        ctx += `  LOTE: ${lote.nombre} — Cultivo: ${lote.ficha.nombre}\n`;
        ctx += `  Progreso: ${pct}% (${etapasConfirmadas.length}/${lote.etapas.length} etapas confirmadas)\n`;

        if (etapasConfirmadas.length > 0) {
          const ultima = etapasConfirmadas[etapasConfirmadas.length - 1];
          ctx += `  Última etapa realizada: ${ultima.nombre} el ${new Date(ultima.fechaReal!).toLocaleDateString('es-CL')}\n`;
        }

        if (etapasPendientes.length > 0) {
          const proxima = etapasPendientes[0];
          const diasHasta = Math.round((new Date(proxima.fechaPlanificada).getTime() - Date.now()) / 86400000);
          ctx += `  Próxima etapa: ${proxima.nombre} — ${new Date(proxima.fechaPlanificada).toLocaleDateString('es-CL')} (${diasHasta > 0 ? `en ${diasHasta} días` : diasHasta === 0 ? 'hoy' : `atrasada ${Math.abs(diasHasta)} días`})\n`;

          const atrasadas = etapasPendientes.filter(e => new Date(e.fechaPlanificada) < new Date());
          if (atrasadas.length > 0) {
            ctx += `  ⚠️ Etapas atrasadas: ${atrasadas.map(e => e.nombre).join(', ')}\n`;
          }
        } else {
          ctx += `  ✅ Ciclo completado\n`;
        }

        if (totalGastos > 0 || totalIngresos > 0) {
          const margen = totalIngresos - totalGastos;
          ctx += `  Economía: Gastos $${totalGastos.toLocaleString('es-CL')} · Ingresos $${totalIngresos.toLocaleString('es-CL')} · Margen $${margen.toLocaleString('es-CL')}\n`;
        }
        ctx += '\n';
      }
    }

    return ctx;
  }

  async consultar(usuarioId: string, pregunta: string): Promise<string> {
    const contexto = await this.construirContexto(usuarioId);

    const prompt = `Eres un asistente agrícola inteligente especializado en horticultura chilena, especialmente en la zona de Talca (VII Región del Maule). Tienes acceso a los datos reales del agricultor y respondes de forma práctica, directa y en español.

DATOS REALES DEL AGRICULTOR:
${contexto}

PREGUNTA DEL AGRICULTOR: ${pregunta}

Responde de forma clara y práctica. Si hay etapas atrasadas, menciónalo con urgencia. Si hay riesgos agronómicos, adviértelos. Usa un tono cercano, como un asesor agrícola de confianza. Máximo 200 palabras.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error('Error al consultar el asistente IA');
    const data = await response.json();
    return data.content[0].text;
  }
}
