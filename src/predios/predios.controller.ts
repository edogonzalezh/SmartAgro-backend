// predios/predios.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrediosService } from './predios.service';

class CrearPredioDto {
  nombre: string;
  ubicacion: string;
  usuarioId: string;
}

@Controller('predios')
export class PrediosController {
  constructor(private prediosService: PrediosService) {}

  @Get()
  listar() {
    return this.prediosService.listar();
  }

  @Post()
  crear(@Body() dto: CrearPredioDto) {
    return this.prediosService.crear(dto.nombre, dto.ubicacion, dto.usuarioId);
  }
}
