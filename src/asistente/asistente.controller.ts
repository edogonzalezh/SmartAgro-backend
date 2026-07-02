// asistente/asistente.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AsistenteService } from './asistente.service';
import { UsuarioActual } from '../auth/usuario-actual.decorator';

class ConsultaDto { pregunta: string; }

@Controller('asistente')
@UseGuards(AuthGuard('jwt'))
export class AsistenteController {
  constructor(private asistenteService: AsistenteService) {}

  @Post('consultar')
  async consultar(
    @UsuarioActual() user: { id: string },
    @Body() dto: ConsultaDto,
  ) {
    const respuesta = await this.asistenteService.consultar(user.id, dto.pregunta);
    return { respuesta };
  }
}
