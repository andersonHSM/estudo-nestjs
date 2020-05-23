import { Test, TestingModule } from '@nestjs/testing';
import { ApontamentosService } from './apontamentos.service';

describe('ApontamentosService', () => {
  let service: ApontamentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApontamentosService],
    }).compile();

    service = module.get<ApontamentosService>(ApontamentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
