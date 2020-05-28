import { Test, TestingModule } from '@nestjs/testing';
import { ProvedoresController } from './provedores.controller';

describe('Provedores Controller', () => {
  let controller: ProvedoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvedoresController],
    }).compile();

    controller = module.get<ProvedoresController>(ProvedoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
