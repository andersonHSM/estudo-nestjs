import {
  Body,
  Controller,
  Post,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { UserCreate } from '@shared/models/users/user-create.models';
import { UsuariosService } from './usuarios.service';

import { hash } from 'bcrypt';

@Controller('users')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async insertUser(@Body() body: UserCreate, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const { email, sobrenome, nome, password, is_provider } = body;
    const [existingUser] = await this.usuariosService.findUserByEmail(email);

    if (existingUser) {
      throw new HttpException(
        { error: 'Usuário já cadastrado!' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // eslint-disable-next-line @typescript-eslint/camelcase
    const password_hash = await hash(password, 10);

    // eslint-disable-next-line @typescript-eslint/camelcase
    const data = { password_hash, email, sobrenome, nome, is_provider };
    const [user] = await this.usuariosService.insertUser(data);

    return res.status(200).json(user);
  }
}
