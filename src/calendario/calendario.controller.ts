// calendario/calendario.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CalendarioService } from './calendario.service';
import { UsuarioActual } from '../auth/usuario-actual.decorator';

class CrearLoteDto    { nombre: string; predioId: string; fichaId: string; fechaInicio: string; }
class ConfirmarDto    { etapaCodigo: string; fechaReal: string; }
class EventoClimaDto  { tipo: 'helada' | 'ola_calor'; fecha: string; }

@Controller('lotes')
@UseGuards(AuthGuard('jwt'))
export class CalendarioController {
  constructor(private calendarioService: CalendarioService) {}

  @Get()
  listarLotes(@UsuarioActual() user: { id: string }) {
    return this.calendarioService.listarLotes(user.id);
  }

  @Post()
  crearLote(@Body() dto: CrearLoteDto) {
    return this.calendarioService.crearLoteConCalendario({
      nombre: dto.nombre,
      predioId: dto.predioId,
      fichaId: dto.fichaId,
      fechaInicio: new Date(dto.fechaInicio),
    });
  }

  @Post(':loteId/confirmar-etapa')
  confirmarEtapa(
    @Param('loteId') loteId: string,
    @Body() dto: ConfirmarDto,
  ) {
    return this.calendarioService.confirmarEtapa(loteId, dto.etapaCodigo, new Date(dto.fechaReal));
  }

  @Post(':loteId/eventos-climaticos')
  registrarEvento(@Param('loteId') loteId: string, @Body() dto: EventoClimaDto) {
    return this.calendarioService.registrarEventoClimatico(loteId, dto.tipo, new Date(dto.fecha));
  }
}
