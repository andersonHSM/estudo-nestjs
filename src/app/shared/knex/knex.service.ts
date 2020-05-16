import { Injectable, Scope } from '@nestjs/common';

import knex = require('knex');

@Injectable({ scope: Scope.DEFAULT })
export class KnexService {
  static connect(enviroment) {
    return knex(enviroment);
  }
}
