// predios/predios.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrediosService {
  constructor(private prisma: PrismaService) {}

  async crear(nombre: string, ubicacion: string, usuarioId: string) {
    return this.prisma.predio.create({
      data: { nombre, ubicacion, usuarioId },
    });
  }

  async listar() {
    return this.prisma.predio.findMany();
  }
}
