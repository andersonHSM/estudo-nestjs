import { Injectable, Inject, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { UsuariosService } from '../usuarios/usuarios.service';

import Knex = require('knex');
import { compare } from 'bcrypt';

import { KNEX_CONNECTION } from '@config/knex/knex.token';
import { LoginData } from '@shared/models/auth/login.model';
import { TabelasSistema } from '@shared/knex/tables.enum';

@Injectable()
export class AuthService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    userLogin: LoginData,
  ): Promise<{ id?: number; error?: string }> {
    const authError = { error: 'Invalid credentials' };
    const { email, password: plainPassword } = userLogin;

    try {
      const hashArray: { id: number; password_hash: string }[] = await this.knex
        .select('id', 'password_hash')
        .from(TabelasSistema.USUARIOS)
        .where({ email })
        .limit(1);

      const { password_hash } = hashArray[0];

      const passwordsMatches = await compare(plainPassword, password_hash);

      if (!passwordsMatches) {
        throw new Error(authError.error);
      }

      const userReturn = await this.usuariosService.findUserByEmail(email);

      return userReturn;
    } catch (error) {
      throw new Error(error);
    }
  }

  login(userId: number) {
    return this.jwtService.sign({ userId });
  }
}
