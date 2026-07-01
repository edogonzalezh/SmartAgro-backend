// notificaciones/notificaciones.module.ts
import { Module } from '@nestjs/common';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService, MailService],
})
export class NotificacionesModule {}
