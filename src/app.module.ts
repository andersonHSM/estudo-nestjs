import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { KnexService } from './services/knex/knex.service';
import { development } from 'config/knex-enviroments';

const knexProvider = {
  provide: 'KNEX',
  useFactory: () => {
    return new KnexService().connect(development);
  },
};

@Module({
  imports: [
    // KnexModule.register({
    //   client: 'mysql',
    //   connection: {
    //     host: '31.170.161.127',
    //     user: 'jfmhost_testenest',
    //     password: '!NX!U-E^@Bje',
    //     port: 3306,
    //     database: 'jfmhost_testenest',
    //   },
    // }),
    // KnexModule.register({
    //   client: 'pg',
    //   connection: {
    //     host: 'localhost',
    //     user: 'postgres',
    //     password: '123',
    //     port: 5432,
    //     database: 'estudo',
    //   },
    // }),
  ],
  controllers: [AppController],
  providers: [AppService, knexProvider],
})
export class AppModule {}
