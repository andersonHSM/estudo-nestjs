import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsuariosService } from '../usuarios/usuarios.service';

import Knex = require('knex');
import { compare } from 'bcrypt';

import { KNEX_CONNECTION } from '@config/knex/knex.token';
import { LoginData } from '@shared/models/auth/login.model';

@Injectable()
export class AuthService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userLogin: LoginData) {
    const authError = { error: 'Invalid credentials' };
    const { email, password: plainPassword } = userLogin;

    const hashArray: { id: number; password_hash: string }[] = await this.knex
      .select('id', 'password_hash')
      .from('usuarios')
      .where({ email })
      .limit(1);

    // eslint-disable-next-line @typescript-eslint/camelcase
    const { password_hash } = hashArray[0];

    const passwordsMatches = await compare(plainPassword, password_hash);

    if (!passwordsMatches) {
      return authError;
    }

    const [userReturn] = await this.usuariosService.findUserByEmail(email);

    return userReturn;
  }

  async login(userId: number) {
    return {
      token: this.jwtService.sign({ userId }),
    };
  }
}
