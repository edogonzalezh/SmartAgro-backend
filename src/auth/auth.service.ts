// auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registro(nombre: string, email: string, password: string) {
    const existe = await this.prisma.usuario.findUnique({ where: { email } });
    if (existe) throw new ConflictException('Ya existe una cuenta con ese correo.');

    const hash = await bcrypt.hash(password, 10);
    const usuario = await this.prisma.usuario.create({
      data: { nombre, email, password: hash },
    });

    return this.firmarToken(usuario.id, usuario.email, usuario.nombre);
  }

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) throw new UnauthorizedException('Correo o contraseña incorrectos.');

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) throw new UnauthorizedException('Correo o contraseña incorrectos.');

    return this.firmarToken(usuario.id, usuario.email, usuario.nombre);
  }

  private firmarToken(id: string, email: string, nombre: string) {
    const token = this.jwt.sign({ sub: id, email, nombre });
    return { token, usuario: { id, email, nombre } };
  }
}
