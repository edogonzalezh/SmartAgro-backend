// economico/economico.controller.ts
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EconomicoService } from './economico.service';
import { UsuarioActual } from '../auth/usuario-actual.decorator';

class GastoDto {
  loteId: string; categoria: string; descripcion: string;
  cantidad?: number; unidad?: string; monto: number; fecha: string;
}
class IngresoDto {
  loteId: string; descripcion: string; cantidad?: number;
  unidad?: string; precioUnitario?: number; monto: number;
  fecha: string; comprador?: string;
}

@Controller('economico')
@UseGuards(AuthGuard('jwt'))
export class EconomicoController {
  constructor(private economicoService: EconomicoService) {}

  @Get('resumen')
  resumenGlobal(@UsuarioActual() user: { id: string }) {
    return this.economicoService.resumenGlobal(user.id);
  }

  @Get('lote/:loteId')
  resumenLote(@Param('loteId') loteId: string) {
    return this.economicoService.resumenLote(loteId);
  }

  @Post('gastos')
  registrarGasto(@Body() dto: GastoDto) {
    return this.economicoService.registrarGasto(dto.loteId, { ...dto, fecha: new Date(dto.fecha) });
  }

  @Get('gastos/:loteId')
  listarGastos(@Param('loteId') loteId: string) {
    return this.economicoService.listarGastos(loteId);
  }

  @Delete('gastos/:gastoId')
  eliminarGasto(@Param('gastoId') gastoId: string) {
    return this.economicoService.eliminarGasto(gastoId);
  }

  @Post('ingresos')
  registrarIngreso(@Body() dto: IngresoDto) {
    return this.economicoService.registrarIngreso(dto.loteId, { ...dto, fecha: new Date(dto.fecha) });
  }

  @Get('ingresos/:loteId')
  listarIngresos(@Param('loteId') loteId: string) {
    return this.economicoService.listarIngresos(loteId);
  }

  @Delete('ingresos/:ingresoId')
  eliminarIngreso(@Param('ingresoId') ingresoId: string) {
    return this.economicoService.eliminarIngreso(ingresoId);
  }
}
