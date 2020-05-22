import { Controller, Post, Body, Req, Patch, Param } from '@nestjs/common';
import { Request } from 'express';

import { ApontamentoCriar } from '@shared/models/apontamentos/apontamento-criar.model';

import { ApontamentosService } from './apontamentos.service';
import { ApontamentoEditar } from '@shared/models/apontamentos/apontamento-editar.model';

@Controller('apontamentos')
export class ApontamentosController {
  constructor(private readonly apontamentosService: ApontamentosService) {}

  @Post()
  async criarApontamento(@Body() body: ApontamentoCriar, @Req() req: Request) {
    const { user } = req;

    return await this.apontamentosService.criar(body, user as string);
  }

  @Patch(':id')
  async inativarApontamento(
    @Body() body: ApontamentoEditar,
    @Req() req: Request,
    @Param() param: { id: string },
  ) {
    const { user } = req;
    const { id } = param;

    return await this.apontamentosService.atualizarApontamento(
      +id,
      body,
      +user,
    );
  }
}
