// tslint:disable: variable-name
import { Injectable, Inject, Logger } from '@nestjs/common';
import { NEST_KNEX_OPTIONS} from './constants';
import { NestKnexOptions } from './interfaces';

/**
 * Sample interface for NestKnexService
 *
 * Customize this as needed to describe the NestKnexService
 *
 */
interface INestKnexService {
  test(): Promise<any>;
}

@Injectable()
/**
 *  You can remove the dependencies on the Logger if you don't need it.  You can also
 *  remove the `async test()` method.
 *
 *  The only thing you need to leave intact is the `@Inject(NEST_KNEX_OPTIONS) private _nest-knexOptions`.
 *
 *  That injected dependency gives you access to the options passed in to
 *  NestKnexService.
 *
 */
export class NestKnexService implements INestKnexService {
  private readonly logger: Logger;
  constructor(
    @Inject(NEST_KNEX_OPTIONS) private _NestKnexOptions: NestKnexOptions,
  ) {
    this.logger = new Logger('NestKnexService');
    this.logger.log(`Options: ${JSON.stringify(this._NestKnexOptions)}`);
  }

  async test(): Promise<any> {
    return 'Hello from NestKnexModule!';
  }
}