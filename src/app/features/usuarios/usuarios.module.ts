import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

import { AvatarModule } from '@common/avatar/avatar.module';
import { KnexModule } from '@shared/knex/knex.module';

@Module({
  imports: [KnexModule, AvatarModule],
  exports: [UsuariosService],
  providers: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
