import { Injectable, Inject } from '@nestjs/common';
import { KNEX_CONNECTION } from 'config/knex/knex.token';

import * as Knex from 'knex';

import { UserCreate } from '@shared/models/users/user-create.models';
import { UserInfoReturn } from '@shared/models/users/user-info-return.model';

@Injectable()
export class UsuariosService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  insertUser(data: UserCreate): Promise<UserInfoReturn[]> {
    return this.knex('usuarios')
      .insert(data)
      .returning(['id', 'nome', 'sobrenome', 'email']);
  }

  findUserByEmail(email: string): Promise<{ id: number }[]> {
    return this.knex('usuarios')
      .select('id')
      .where({ email })
      .limit(1);
  }
}
