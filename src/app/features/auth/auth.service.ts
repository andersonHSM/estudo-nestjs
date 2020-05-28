import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsuariosService } from '../usuarios/usuarios.service';

import { compare } from 'bcrypt';

import { LoginData } from '@shared/models/auth/login.model';
import { usuarioNaoEncontradoException } from '@shared/exceptions/usuarios/usuario-nao-encontrado';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    userLogin: LoginData,
  ): Promise<{ id?: number; error?: string }> {
    const authError = {
      error: 'Email ou senha inválidos.',
    };
    const { email, password: plainPassword } = userLogin;

    try {
      const user = await this.usuariosService.retornarUsuarioComCredenciais(
        email,
      );

      if (!user) {
        throw new HttpException(authError, HttpStatus.BAD_REQUEST);
      }

      const { password_hash } = user;

      const passwordsMatches = await compare(plainPassword, password_hash);

      if (!passwordsMatches) {
        throw new HttpException(authError, HttpStatus.BAD_REQUEST);
      }

      const userReturn = await this.usuariosService.findUserByEmail(email);

      return userReturn;
    } catch (error) {
      throw error;
    }
  }

  login(userId: number) {
    return this.jwtService.sign({ userId });
  }
}
