// prisma/seed.ts
// Carga las fichas técnicas iniciales (tomate y lechuga, Talca) en la base de datos.
// Ejecutar con: npx prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.fichaCultivo.create({
    data: {
      id: 'tomate_talca',
      nombre: 'Tomate - Talca',
      cultivo: 'tomate',
      zona: 'Talca',
      etapas: {
        create: [
          { etapaCodigo: 'almacigo', nombre: 'Siembra almácigo', orden: 1, duracionDesdeAnterior: 0 },
          { etapaCodigo: 'trasplante', nombre: 'Trasplante', orden: 2, duracionDesdeAnterior: 30 },
          { etapaCodigo: 'floracion', nombre: 'Inicio floración', orden: 3, duracionDesdeAnterior: 30 },
          { etapaCodigo: 'fructificacion', nombre: 'Inicio fructificación', orden: 4, duracionDesdeAnterior: 18 },
          { etapaCodigo: 'inicio_cosecha', nombre: 'Inicio cosecha', orden: 5, duracionDesdeAnterior: 25 },
          { etapaCodigo: 'fin_cosecha', nombre: 'Fin cosecha', orden: 6, duracionDesdeAnterior: 60 },
        ],
      },
      tareas: {
        create: [
          { nombre: 'Primera fertilización', etapaAncla: 'trasplante', offsetDias: 7 },
          { nombre: 'Tutorado', etapaAncla: 'trasplante', offsetDias: 18 },
          { nombre: 'Monitoreo Tuta absoluta / mosca blanca', etapaAncla: 'floracion', offsetDias: 0 },
          { nombre: 'Segunda fertilización', etapaAncla: 'floracion', offsetDias: 10 },
        ],
      },
    },
  });

  await prisma.fichaCultivo.create({
    data: {
      id: 'lechuga_talca',
      nombre: 'Lechuga - Talca',
      cultivo: 'lechuga',
      zona: 'Talca',
      etapas: {
        create: [
          { etapaCodigo: 'almacigo', nombre: 'Siembra almácigo', orden: 1, duracionDesdeAnterior: 0 },
          { etapaCodigo: 'trasplante', nombre: 'Trasplante', orden: 2, duracionDesdeAnterior: 22 },
          { etapaCodigo: 'cosecha', nombre: 'Cosecha', orden: 3, duracionDesdeAnterior: 45 },
        ],
      },
      tareas: {
        create: [
          { nombre: 'Fertilización al trasplante', etapaAncla: 'trasplante', offsetDias: 2 },
          { nombre: 'Fertilización media', etapaAncla: 'trasplante', offsetDias: 20 },
          { nombre: 'Control de malezas', etapaAncla: 'trasplante', offsetDias: 10 },
        ],
      },
    },
  });

  console.log('Fichas técnicas de tomate y lechuga (Talca) cargadas correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
