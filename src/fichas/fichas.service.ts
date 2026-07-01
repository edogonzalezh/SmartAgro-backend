// fichas/fichas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FichasService {
  constructor(private prisma: PrismaService) {}

  listar() {
    return this.prisma.fichaCultivo.findMany({
      include: { etapas: { orderBy: { orden: 'asc' } }, tareas: true },
    });
  }

  async obtener(id: string) {
    const ficha = await this.prisma.fichaCultivo.findUnique({
      where: { id },
      include: { etapas: { orderBy: { orden: 'asc' } }, tareas: true },
    });
    if (!ficha) throw new NotFoundException(`Ficha no encontrada: ${id}`);
    return ficha;
  }

  async crear(data: {
    id: string; nombre: string; cultivo: string; zona: string;
    etapas: { etapaCodigo: string; nombre: string; orden: number; duracionDesdeAnterior: number }[];
    tareas: { nombre: string; etapaAncla: string; offsetDias: number }[];
  }) {
    return this.prisma.fichaCultivo.create({
      data: {
        id: data.id, nombre: data.nombre, cultivo: data.cultivo, zona: data.zona,
        etapas: { create: data.etapas },
        tareas: { create: data.tareas },
      },
      include: { etapas: true, tareas: true },
    });
  }

  async actualizarEtapa(etapaId: string, duracionDesdeAnterior: number) {
    return this.prisma.etapaFicha.update({
      where: { id: etapaId },
      data: { duracionDesdeAnterior },
    });
  }

  async actualizarTarea(tareaId: string, offsetDias: number) {
    return this.prisma.tareaFicha.update({
      where: { id: tareaId },
      data: { offsetDias },
    });
  }

  async eliminar(id: string) {
    await this.prisma.tareaFicha.deleteMany({ where: { fichaId: id } });
    await this.prisma.etapaFicha.deleteMany({ where: { fichaId: id } });
    return this.prisma.fichaCultivo.delete({ where: { id } });
  }
}
