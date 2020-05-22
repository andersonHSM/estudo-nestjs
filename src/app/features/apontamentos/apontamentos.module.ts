import { Module } from '@nestjs/common';

import { KnexModule } from '@shared/knex/knex.module';

import { ApontamentosService } from './apontamentos.service';
import { ApontamentosController } from './apontamentos.controller';

@Module({
  imports: [KnexModule],
  providers: [ApontamentosService],
  controllers: [ApontamentosController],
})
export class ApontamentosModule {}
