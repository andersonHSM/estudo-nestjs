import { Module, forwardRef } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

import { AvatarModule } from '@common/avatar/avatar.module';
import { KnexModule } from '@shared/knex/knex.module';
import { ApontamentosModule } from '../apontamentos/apontamentos.module';

@Module({
  imports: [forwardRef(() => ApontamentosModule), KnexModule, AvatarModule],
  exports: [UsuariosService],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
