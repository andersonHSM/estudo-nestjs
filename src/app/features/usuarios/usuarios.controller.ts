import { Body, Controller, Post } from '@nestjs/common';
import { UserCreate } from 'src/app/shared/models/users/user-create.models';
import { UsuariosService } from './usuarios.service';

import { hash } from 'bcrypt';

@Controller('users')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async insertUser(@Body() body: UserCreate) {
    const { email, sobrenome, nome, password } = body;

    const [existingUser] = await this.usuariosService.findUserByEmail(email);
    console.log(existingUser);
    if (existingUser) {
      return { error: 'Usuário já cadastrado.' };
    }

    // eslint-disable-next-line @typescript-eslint/camelcase
    const password_hash = await hash(password, 10);

    // eslint-disable-next-line @typescript-eslint/camelcase
    const data = { password_hash, email, sobrenome, nome };
    const [user] = await this.usuariosService.insertUser(data);

    return user;
  }
}
