import { Test, TestingModule } from '@nestjs/testing';
import { ApontamentosController } from './apontamentos.controller';

describe('Apontamentos Controller', () => {
  let controller: ApontamentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApontamentosController],
    }).compile();

    controller = module.get<ApontamentosController>(ApontamentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
