import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsuariosModule } from './app/features/usuarios/usuarios.module';
import { AuthModule } from './app/features/auth/auth.module';

@Module({
  imports: [UsuariosModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
