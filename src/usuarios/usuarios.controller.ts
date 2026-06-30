// usuarios/usuarios.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

class CrearUsuarioDto {
  nombre: string;
  email: string;
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crearOEncontrar(dto.nombre, dto.email);
  }
}
