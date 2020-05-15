import { Injectable, Inject } from '@nestjs/common';
import Knex = require('knex');

import { KNEX_CONNECTION } from 'config/knex/knex.token';

@Injectable()
export class AppService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(data: any) {
    const user = await this.knex('usuarios')
      // .returning(['name', 'sobrenome'])
      .insert(data, ['name', 'sobrenome']);

    console.log(user);
    return user;
  }

  async getData() {
    return await this.knex('usuarios')
      .select('*')
      .from('usuarios');
  }
}
