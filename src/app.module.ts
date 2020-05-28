import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsuariosModule } from './app/features/usuarios/usuarios.module';
import { AuthModule } from './app/features/auth/auth.module';
import { JwtMiddleware } from '@shared/middlewares/jwt/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { AvatarModule } from '@common/avatar/avatar.module';
import { ApontamentosModule } from './app/features/apontamentos/apontamentos.module';
import { ProvedoresModule } from '@features/provedores/provedores.module';

@Module({
  imports: [
    UsuariosModule,
    ProvedoresModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
    }),
    AvatarModule,
    ApontamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'users/(.*)', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
