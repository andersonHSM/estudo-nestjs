import { Module } from '@nestjs/common';

import { KNEX_CONNECTION } from 'config/knex/knex.token';
import { environments } from 'config/knex/knex-environments';
import { KnexService } from './knex.service';

const knexProvider = {
  provide: KNEX_CONNECTION,
  useFactory: () => {
    const enviroment = environments[process.env.NODE_ENV];
    return KnexService.connect(enviroment);
  },
};

@Module({
  providers: [knexProvider],
  exports: [knexProvider],
})
export class KnexModule {}
