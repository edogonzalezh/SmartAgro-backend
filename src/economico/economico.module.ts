// economico/economico.module.ts
import { Module } from '@nestjs/common';
import { EconomicoController } from './economico.controller';
import { EconomicoService } from './economico.service';

@Module({
  controllers: [EconomicoController],
  providers: [EconomicoService],
})
export class EconomicoModule {}
