import { Test, TestingModule } from '@nestjs/testing';
import { KnexService } from './knex.service';

import { environments } from '../../../../config/knex/knex-environments';

describe('KnexService', () => {
  let service: KnexService;
  let environment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: KnexService, useValue: true }],
    }).compile();

    service = module.get<KnexService>(KnexService);
    environment = environments.development;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a Knex instance', async () => {
    const connection = KnexService.connect(environment);
    expect(connection).toBeDefined();
  });
});
