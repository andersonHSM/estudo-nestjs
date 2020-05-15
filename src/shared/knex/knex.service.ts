import { Injectable } from '@nestjs/common';

import knex = require('knex');

@Injectable()
export class KnexService {
  static connect(enviroment) {
    return knex(enviroment);
  }
}
