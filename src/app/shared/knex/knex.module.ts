import { Module } from '@nestjs/common';

import { KNEX_CONNECTION } from 'src/config/knex/knex.token';
import environment from '@config/knex/knex-environments';
import Knex = require('knex');

const knexProvider = {
  provide: KNEX_CONNECTION,
  useFactory: () => {
    return Knex(environment);
  },
};

@Module({
  providers: [knexProvider],
  exports: [knexProvider],
})
export class KnexModule {}
