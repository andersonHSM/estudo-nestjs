import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { KnexService } from './services/knex/knex.service';
import { enviroments } from 'config/knex/knex-enviroments';
import { KNEX_CONNECTION } from 'config/knex/knex.token';

const knexProvider = {
  provide: KNEX_CONNECTION,
  useFactory: () => {
    const enviroment = enviroments[process.env.NODE_ENV];
    return KnexService.connect(enviroment);
  },
};

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, knexProvider],
})
export class AppModule {}
