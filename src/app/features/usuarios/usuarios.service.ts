import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { KNEX_CONNECTION } from '@config/knex/knex.token';

import * as Knex from 'knex';

import { UserCreate } from '@shared/models/users/user-create.models';
import { UserInfoReturn } from '@shared/models/users/user-info-return.model';
import { UserPatch } from '@shared/models/users/user-patch.model';

@Injectable()
export class UsuariosService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}
  async isProvider(id: number): Promise<boolean> {
    const [user] = (await this.knex('usuarios')
      .where({ id, is_provider: true })
      .returning('id')) as { id: number }[];

    return user ? true : false;
  }

  async findUserById(id: number): Promise<{ id: number }> {
    const [user] = await this.knex('usuarios')
      .where({ id })
      .select({ id })
      .returning('id');

    return user;
  }

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

  async updateUser(paramId: string, reqId: string, data: UserPatch) {
    if (paramId !== reqId) {
      throw new HttpException(
        {
          error: `You can't change others users info.`,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      return await this.knex('usuarios')
        .where({ id: paramId })
        .update(data)
        .returning([
          'id',
          'nome',
          'sobrenome',
          'email',
          'avatar_id',
          'is_provider',
        ]);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
