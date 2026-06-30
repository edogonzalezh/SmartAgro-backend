// usuarios/usuarios.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async crearOEncontrar(nombre: string, email: string) {
    const existente = await this.prisma.usuario.findUnique({ where: { email } });
    if (existente) return existente;

    return this.prisma.usuario.create({
      data: { nombre, email, password: 'sin-auth-mvp' }, // auth real se agrega en fase posterior
    });
  }

  async listar() {
    return this.prisma.usuario.findMany();
  }
}
