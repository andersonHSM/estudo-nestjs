import { Module } from '@nestjs/common';
import { ProvedoresController } from './provedores.controller';
import { ProvedoresService } from './provedores.service';

import { ApontamentosModule } from '@features/apontamentos/apontamentos.module';
import { UsuariosModule } from '@features/usuarios/usuarios.module';
import { KnexModule } from '@shared/knex/knex.module';

@Module({
  imports: [ApontamentosModule, UsuariosModule, KnexModule],
  controllers: [ProvedoresController],
  providers: [ProvedoresService],
})
export class ProvedoresModule {}
