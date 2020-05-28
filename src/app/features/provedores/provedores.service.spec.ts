import { Test, TestingModule } from '@nestjs/testing';
import { ProvedoresService } from './provedores.service';

describe('ProvedoresService', () => {
  let service: ProvedoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvedoresService],
    }).compile();

    service = module.get<ProvedoresService>(ProvedoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
