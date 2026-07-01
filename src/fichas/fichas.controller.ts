// fichas/fichas.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FichasService } from './fichas.service';

@Controller('fichas')
@UseGuards(AuthGuard('jwt'))
export class FichasController {
  constructor(private fichasService: FichasService) {}

  @Get()
  listar() { return this.fichasService.listar(); }

  @Get(':id')
  obtener(@Param('id') id: string) { return this.fichasService.obtener(id); }

  @Post()
  crear(@Body() body: any) { return this.fichasService.crear(body); }

  @Patch('etapas/:etapaId')
  actualizarEtapa(@Param('etapaId') id: string, @Body() body: { duracionDesdeAnterior: number }) {
    return this.fichasService.actualizarEtapa(id, body.duracionDesdeAnterior);
  }

  @Patch('tareas/:tareaId')
  actualizarTarea(@Param('tareaId') id: string, @Body() body: { offsetDias: number }) {
    return this.fichasService.actualizarTarea(id, body.offsetDias);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) { return this.fichasService.eliminar(id); }
}
