// prisma/seed-cultivos.ts
// Carga fichas técnicas adicionales para la zona de Talca, VII Región
// Ejecutar con: npx ts-node prisma/seed-cultivos.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  // ── PIMENTÓN ──────────────────────────────────────────────────────
  const pimentonExiste = await prisma.fichaCultivo.findUnique({ where: { id: 'pimenton_talca' } });
  if (!pimentonExiste) {
    await prisma.fichaCultivo.create({
      data: {
        id: 'pimenton_talca', nombre: 'Pimentón - Talca', cultivo: 'pimenton', zona: 'Talca',
        etapas: {
          create: [
            { etapaCodigo: 'almacigo',      nombre: 'Siembra almácigo',     orden: 1, duracionDesdeAnterior: 0  },
            { etapaCodigo: 'trasplante',    nombre: 'Trasplante',            orden: 2, duracionDesdeAnterior: 60 },
            { etapaCodigo: 'floracion',     nombre: 'Inicio floración',      orden: 3, duracionDesdeAnterior: 45 },
            { etapaCodigo: 'fructificacion',nombre: 'Inicio fructificación', orden: 4, duracionDesdeAnterior: 20 },
            { etapaCodigo: 'inicio_cosecha',nombre: 'Inicio cosecha',        orden: 5, duracionDesdeAnterior: 25 },
            { etapaCodigo: 'fin_cosecha',   nombre: 'Fin cosecha',           orden: 6, duracionDesdeAnterior: 90 },
          ],
        },
        tareas: {
          create: [
            { nombre: 'Primera fertilización',          etapaAncla: 'trasplante',    offsetDias: 7  },
            { nombre: 'Tutorado',                        etapaAncla: 'trasplante',    offsetDias: 20 },
            { nombre: 'Monitoreo ácaros y trips',        etapaAncla: 'floracion',     offsetDias: 0  },
            { nombre: 'Segunda fertilización',           etapaAncla: 'floracion',     offsetDias: 15 },
            { nombre: 'Control Botrytis preventivo',     etapaAncla: 'fructificacion',offsetDias: 5  },
          ],
        },
      },
    });
    console.log('✅ Pimentón - Talca cargado');
  } else { console.log('⏭️  Pimentón ya existe'); }

  // ── ZAPALLO ───────────────────────────────────────────────────────
  const zapalloExiste = await prisma.fichaCultivo.findUnique({ where: { id: 'zapallo_talca' } });
  if (!zapalloExiste) {
    await prisma.fichaCultivo.create({
      data: {
        id: 'zapallo_talca', nombre: 'Zapallo - Talca', cultivo: 'zapallo', zona: 'Talca',
        etapas: {
          create: [
            { etapaCodigo: 'siembra',       nombre: 'Siembra directa',       orden: 1, duracionDesdeAnterior: 0  },
            { etapaCodigo: 'raleo',         nombre: 'Raleo de plantas',       orden: 2, duracionDesdeAnterior: 20 },
            { etapaCodigo: 'floracion',     nombre: 'Inicio floración',       orden: 3, duracionDesdeAnterior: 30 },
            { etapaCodigo: 'fructificacion',nombre: 'Inicio fructificación',  orden: 4, duracionDesdeAnterior: 15 },
            { etapaCodigo: 'inicio_cosecha',nombre: 'Inicio cosecha',         orden: 5, duracionDesdeAnterior: 35 },
            { etapaCodigo: 'fin_cosecha',   nombre: 'Fin cosecha',            orden: 6, duracionDesdeAnterior: 30 },
          ],
        },
        tareas: {
          create: [
            { nombre: 'Primera fertilización',     etapaAncla: 'siembra',   offsetDias: 15 },
            { nombre: 'Control de malezas',         etapaAncla: 'siembra',   offsetDias: 20 },
            { nombre: 'Segunda fertilización',      etapaAncla: 'floracion', offsetDias: 5  },
            { nombre: 'Monitoreo mosca del zapallo',etapaAncla: 'floracion', offsetDias: 0  },
          ],
        },
      },
    });
    console.log('✅ Zapallo - Talca cargado');
  } else { console.log('⏭️  Zapallo ya existe'); }

  // ── CEBOLLA ───────────────────────────────────────────────────────
  const cebollaExiste = await prisma.fichaCultivo.findUnique({ where: { id: 'cebolla_talca' } });
  if (!cebollaExiste) {
    await prisma.fichaCultivo.create({
      data: {
        id: 'cebolla_talca', nombre: 'Cebolla - Talca', cultivo: 'cebolla', zona: 'Talca',
        etapas: {
          create: [
            { etapaCodigo: 'almacigo',       nombre: 'Siembra almácigo',      orden: 1, duracionDesdeAnterior: 0  },
            { etapaCodigo: 'trasplante',     nombre: 'Trasplante',             orden: 2, duracionDesdeAnterior: 65 },
            { etapaCodigo: 'bulbificacion',  nombre: 'Inicio bulbificación',   orden: 3, duracionDesdeAnterior: 60 },
            { etapaCodigo: 'inicio_cosecha', nombre: 'Inicio cosecha',         orden: 4, duracionDesdeAnterior: 30 },
            { etapaCodigo: 'fin_cosecha',    nombre: 'Fin cosecha',            orden: 5, duracionDesdeAnterior: 20 },
          ],
        },
        tareas: {
          create: [
            { nombre: 'Primera fertilización',    etapaAncla: 'trasplante',   offsetDias: 10 },
            { nombre: 'Control de malezas',        etapaAncla: 'trasplante',   offsetDias: 15 },
            { nombre: 'Segunda fertilización',     etapaAncla: 'trasplante',   offsetDias: 30 },
            { nombre: 'Monitoreo trips de cebolla',etapaAncla: 'bulbificacion',offsetDias: 0  },
            { nombre: 'Reducción de riego',        etapaAncla: 'bulbificacion',offsetDias: 15 },
          ],
        },
      },
    });
    console.log('✅ Cebolla - Talca cargado');
  } else { console.log('⏭️  Cebolla ya existe'); }

  console.log('\nCultivos adicionales cargados correctamente.');
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
