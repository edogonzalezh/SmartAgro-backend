// notificaciones/notificaciones.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  /**
   * Revisa todas las etapas sin confirmar que vencen en los próximos 'diasAntes' días
   * y envía correos de recordatorio. Diseñado para llamarse con un cron diario.
   */
  async enviarRecordatoriosDiarios(diasAntes = 3) {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const limite = new Date(hoy); limite.setDate(hoy.getDate() + diasAntes);

    const etapas = await this.prisma.etapaLote.findMany({
      where: {
        fechaReal: null,
        fechaPlanificada: { gte: hoy, lte: limite },
      },
      include: {
        lote: {
          include: {
            predio: { include: { usuario: true } },
          },
        },
      },
    });

    this.logger.log(`Notificaciones: ${etapas.length} etapas próximas encontradas`);

    for (const etapa of etapas) {
      const usuario = etapa.lote.predio.usuario;
      const diasRestantes = Math.round(
        (etapa.fechaPlanificada.getTime() - hoy.getTime()) / 86400000
      );

      await this.mail.enviarRecordatorio({
        destinatario: usuario.email,
        nombreAgricultor: usuario.nombre,
        nombreEtapa: etapa.nombre,
        nombreLote: etapa.lote.nombre,
        fechaPlanificada: etapa.fechaPlanificada,
        diasRestantes,
      });
    }

    return { enviados: etapas.length };
  }
}
