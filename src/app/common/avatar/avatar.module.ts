import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { KnexModule } from '@shared/knex/knex.module';

@Module({
  imports: [KnexModule],
  exports: [AvatarService],
  controllers: [AvatarController],
  providers: [AvatarService],
})
export class AvatarModule {}
