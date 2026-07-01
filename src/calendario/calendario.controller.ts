// calendario/calendario.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CalendarioService } from './calendario.service';
import { UsuarioActual } from '../auth/usuario-actual.decorator';

class CrearLoteDto   { nombre: string; predioId: string; fichaId: string; fechaInicio: string; }
class ConfirmarDto   { etapaCodigo: string; fechaReal: string; fechaRealFin?: string; notas?: string; }
class EventoClimaDto { tipo: 'helada' | 'ola_calor'; fecha: string; }
class ActualizarLoteDto { nombre?: string; notas?: string; }

@Controller('lotes')
@UseGuards(AuthGuard('jwt'))
export class CalendarioController {
  constructor(private calendarioService: CalendarioService) {}

  @Get()
  listarLotes(@UsuarioActual() user: { id: string }) {
    return this.calendarioService.listarLotes(user.id);
  }

  @Get('predios')
  listarPredios(@UsuarioActual() user: { id: string }) {
    return this.calendarioService.listarPredios(user.id);
  }

  @Get(':loteId')
  obtenerLote(@Param('loteId') loteId: string, @UsuarioActual() user: { id: string }) {
    return this.calendarioService.obtenerLote(loteId, user.id);
  }

  @Post()
  crearLote(@Body() dto: CrearLoteDto) {
    return this.calendarioService.crearLoteConCalendario({
      nombre: dto.nombre, predioId: dto.predioId,
      fichaId: dto.fichaId, fechaInicio: new Date(dto.fechaInicio),
    });
  }

  @Patch(':loteId')
  actualizarLote(
    @Param('loteId') loteId: string,
    @UsuarioActual() user: { id: string },
    @Body() dto: ActualizarLoteDto,
  ) {
    return this.calendarioService.actualizarLote(loteId, user.id, dto);
  }

  @Delete(':loteId')
  eliminarLote(@Param('loteId') loteId: string, @UsuarioActual() user: { id: string }) {
    return this.calendarioService.eliminarLote(loteId, user.id);
  }

  @Post(':loteId/confirmar-etapa')
  confirmarEtapa(@Param('loteId') loteId: string, @Body() dto: ConfirmarDto) {
    return this.calendarioService.confirmarEtapaConNotas(
      loteId, dto.etapaCodigo, new Date(dto.fechaReal),
      dto.fechaRealFin ? new Date(dto.fechaRealFin) : undefined,
      dto.notas,
    );
  }

  @Post(':loteId/eventos-climaticos')
  registrarEvento(@Param('loteId') loteId: string, @Body() dto: EventoClimaDto) {
    return this.calendarioService.registrarEventoClimatico(loteId, dto.tipo, new Date(dto.fecha));
  }
}
