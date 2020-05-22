import { Module } from '@nestjs/common';

import { KnexModule } from '@shared/knex/knex.module';

import { ApontamentosService } from './apontamentos.service';
import { ApontamentosController } from './apontamentos.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [KnexModule, UsuariosModule],
  providers: [ApontamentosService],
  controllers: [ApontamentosController],
})
export class ApontamentosModule {}
