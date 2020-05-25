import { Module, forwardRef } from '@nestjs/common';

import { KnexModule } from '@shared/knex/knex.module';

import { ApontamentosService } from './apontamentos.service';
import { ApontamentosController } from './apontamentos.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [KnexModule, forwardRef(() => UsuariosModule)],
  exports: [ApontamentosService],
  providers: [ApontamentosService],
  controllers: [ApontamentosController],
})
export class ApontamentosModule {}
