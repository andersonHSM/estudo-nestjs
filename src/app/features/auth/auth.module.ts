import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { KnexModule } from '@shared/knex/knex.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

// import { LocalStrategy } from './passport/strategies/local.strategy';
// import { JwtStrategy } from './passport/strategies/jwt.strategy';

@Module({
  imports: [
    KnexModule,
    UsuariosModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
