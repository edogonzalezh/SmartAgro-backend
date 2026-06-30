// app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CalendarioModule } from './calendario/calendario.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrediosModule } from './predios/predios.module';

@Module({
  imports: [PrismaModule, CalendarioModule, UsuariosModule, PrediosModule],
})
export class AppModule {}
