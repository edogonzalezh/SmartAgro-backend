// app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CalendarioModule } from './calendario/calendario.module';

@Module({
  imports: [PrismaModule, CalendarioModule],
})
export class AppModule {}
