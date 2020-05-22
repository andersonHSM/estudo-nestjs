import { Injectable, Inject } from '@nestjs/common';
import { KNEX_CONNECTION } from '@config/knex/knex.token';

import * as Knex from 'knex';

import { UserCreate } from '@shared/models/users/user-create.models';
import { UserInfoReturn } from '@shared/models/users/user-info-return.model';

@Injectable()
export class UsuariosService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async insertUser(data: UserCreate): Promise<UserInfoReturn[]> {
    return await this.knex('usuarios')
      .insert(data)
      .returning(['id', 'nome', 'sobrenome', 'email', 'is_provider']);
  }

  async findUserByEmail(email: string): Promise<{ id: number }[]> {
    return await this.knex('usuarios')
      .select('id')
      .where({ email })
      .limit(1);
  }
}
