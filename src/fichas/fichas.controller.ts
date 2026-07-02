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

  @Delete(':id')
  eliminar(@Param('id') id: string) { return this.fichasService.eliminar(id); }

  // ── Etapas ──────────────────────────────────────────────────────
  @Patch('etapas/:etapaId')
  actualizarEtapa(@Param('etapaId') id: string, @Body() body: { duracionDesdeAnterior: number }) {
    return this.fichasService.actualizarEtapa(id, body.duracionDesdeAnterior);
  }

  @Post(':fichaId/etapas')
  agregarEtapa(@Param('fichaId') fichaId: string, @Body() body: any) {
    return this.fichasService.agregarEtapa(fichaId, body);
  }

  @Delete('etapas/:etapaId')
  eliminarEtapa(@Param('etapaId') id: string) {
    return this.fichasService.eliminarEtapa(id);
  }

  @Patch('etapas/:etapaId/orden')
  reordenarEtapa(@Param('etapaId') id: string, @Body() body: { orden: number }) {
    return this.fichasService.reordenarEtapa(id, body.orden);
  }

  // ── Tareas ──────────────────────────────────────────────────────
  @Patch('tareas/:tareaId')
  actualizarTarea(@Param('tareaId') id: string, @Body() body: { offsetDias: number }) {
    return this.fichasService.actualizarTarea(id, body.offsetDias);
  }

  @Post(':fichaId/tareas')
  agregarTarea(@Param('fichaId') fichaId: string, @Body() body: any) {
    return this.fichasService.agregarTarea(fichaId, body);
  }

  @Delete('tareas/:tareaId')
  eliminarTarea(@Param('tareaId') id: string) {
    return this.fichasService.eliminarTarea(id);
  }
}
