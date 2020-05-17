import { Module } from '@nestjs/common';

import { KNEX_CONNECTION } from 'src/app/config/knex/knex.token';
import environment from 'src/app/config/knex/knex-environments';
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
