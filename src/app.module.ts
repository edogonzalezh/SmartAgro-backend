import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CalendarioModule } from './calendario/calendario.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrediosModule } from './predios/predios.module';
import { AuthModule } from './auth/auth.module';
import { FichasModule } from './fichas/fichas.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EconomicoModule } from './economico/economico.module';

@Module({
  imports: [
    PrismaModule, AuthModule, CalendarioModule,
    UsuariosModule, PrediosModule, FichasModule,
    NotificacionesModule, EconomicoModule,
  ],
})
export class AppModule {}
