// notificaciones/notificaciones.controller.ts
import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
@UseGuards(AuthGuard('jwt'))
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  // POST /notificaciones/enviar?dias=3
  // En producción esto se llama con un cron job diario desde Railway o un servicio externo
  @Post('enviar')
  enviar(@Query('dias') dias?: string) {
    return this.notificacionesService.enviarRecordatoriosDiarios(
      dias ? parseInt(dias) : 3,
    );
  }
}
