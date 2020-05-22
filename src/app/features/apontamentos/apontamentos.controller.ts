import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';

import { ApontamentoCriar } from '@shared/models/apontamentos/apontamento-criar.model';

import { ApontamentosService } from './apontamentos.service';

@Controller('apontamentos')
export class ApontamentosController {
  constructor(private readonly apontamentosService: ApontamentosService) {}

  @Post()
  criarApontamento(@Body() body: ApontamentoCriar, @Req() req: Request) {
    const { user } = req;

    return this.apontamentosService.criar(body, user as string);
  }
}
