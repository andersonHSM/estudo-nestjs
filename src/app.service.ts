import { Injectable, Inject } from '@nestjs/common';
import Knex = require('knex');

import { KNEX_CONNECTION } from 'config/knex/knex.token';

@Injectable()
export class AppService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  getHello(): string {
    return 'Hello World!';
  }

  createUser(data: any) {
    return this.knex('usuarios')
      .returning(['name', 'sobrenome'])
      .insert(data, ['name', 'sobrenome']);
  }

  getData() {
    return this.knex('usuarios')
      .select('*')
      .from('usuarios');
  }
}
