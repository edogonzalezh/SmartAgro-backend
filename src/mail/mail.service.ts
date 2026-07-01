// mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT ?? '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async enviarRecordatorio(params: {
    destinatario: string;
    nombreAgricultor: string;
    nombreEtapa: string;
    nombreLote: string;
    fechaPlanificada: Date;
    diasRestantes: number;
  }) {
    const { destinatario, nombreAgricultor, nombreEtapa, nombreLote, fechaPlanificada, diasRestantes } = params;
    const fechaStr = fechaPlanificada.toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' });
    const urgencia = diasRestantes === 0 ? '🔴 Hoy' : diasRestantes <= 3 ? `🟠 En ${diasRestantes} días` : `🟢 En ${diasRestantes} días`;

    try {
      await this.transporter.sendMail({
        from: `SmartAgro <${process.env.MAIL_USER}>`,
        to: destinatario,
        subject: `${urgencia}: ${nombreEtapa} — ${nombreLote}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <div style="background:#2d6a4f;borderRadius:8px;padding:20px;color:#fff;marginBottom:20px">
              <div style="fontSize:12px;letterSpacing:0.1em;opacity:0.7;marginBottom:4px">SMARTAGRO</div>
              <h1 style="fontSize:20px;margin:0">Recordatorio de labor agrícola</h1>
            </div>
            <p style="fontSize:16px;color:#333">Hola <strong>${nombreAgricultor}</strong>,</p>
            <div style="background:#f4f7f4;borderRadius:8px;padding:16px;margin:16px 0;border-left:4px solid #2d6a4f">
              <div style="fontSize:12px;color:#888;textTransform:uppercase;letterSpacing:0.05em">Labor pendiente</div>
              <div style="fontSize:20px;fontWeight:700;color:#1a1f1a;margin:4px 0">${nombreEtapa}</div>
              <div style="fontSize:14px;color:#556055">Lote: ${nombreLote}</div>
              <div style="fontSize:14px;color:#556055;marginTop:4px">Fecha: ${fechaStr}</div>
            </div>
            <p style="fontSize:14px;color:#666">Recuerda confirmar en SmartAgro una vez realizada la labor para que el calendario se actualice.</p>
            <a href="${process.env.FRONTEND_URL ?? 'https://smart-agro-frontend-alpha.vercel.app'}"
               style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 20px;borderRadius:8px;textDecoration:none;fontWeight:600;marginTop:8px">
              Abrir SmartAgro →
            </a>
          </div>
        `,
      });
      this.logger.log(`Recordatorio enviado a ${destinatario}: ${nombreEtapa}`);
    } catch (err) {
      this.logger.error(`Error enviando correo a ${destinatario}:`, err);
    }
  }
}
