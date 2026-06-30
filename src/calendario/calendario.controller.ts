// calendario.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CalendarioService } from './calendario.service';

class CrearLoteDto {
  nombre: string;
  predioId: string;
  fichaId: string; // ej: "tomate_talca"
  fechaInicio: string; // ISO date string
}

class ConfirmarEtapaDto {
  etapaCodigo: string; // ej: "trasplante"
  fechaReal: string; // ISO date string
}

class EventoClimaticoDto {
  tipo: 'helada' | 'ola_calor';
  fecha: string; // ISO date string
}

@Controller('lotes')
export class CalendarioController {
  constructor(private calendarioService: CalendarioService) {}

  @Get()
  listarLotes() {
    return this.calendarioService.listarLotes();
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
  confirmarEtapa(@Param('loteId') loteId: string, @Body() dto: ConfirmarEtapaDto) {
    return this.calendarioService.confirmarEtapa(
      loteId,
      dto.etapaCodigo,
      new Date(dto.fechaReal),
    );
  }

  @Post(':loteId/eventos-climaticos')
  registrarEvento(@Param('loteId') loteId: string, @Body() dto: EventoClimaticoDto) {
    return this.calendarioService.registrarEventoClimatico(
      loteId,
      dto.tipo,
      new Date(dto.fecha),
    );
  }
}
