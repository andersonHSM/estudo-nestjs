import { Injectable } from '@nestjs/common';

import * as knex from 'knex';

@Injectable()
export class KnexService {
  connect(enviroment) {
    return knex(enviroment);
  }
}
