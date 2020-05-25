import { Controller, Post, Body, Req, Patch, Param, Get } from '@nestjs/common';
import { Request } from 'express';

import { ApontamentoCriar } from '@shared/models/apontamentos/apontamento-criar.model';

import { ApontamentosService } from './apontamentos.service';
import { ApontamentoEditar } from '@shared/models/apontamentos/apontamento-editar.model';

@Controller('apontamentos')
export class ApontamentosController {
  constructor(private readonly apontamentosService: ApontamentosService) {}

  @Get()
  listar(@Req() req: Request) {
    const reqId = req.user as number;

    return this.apontamentosService.listarApontamentos(reqId);
  }

  @Post()
  async criarApontamento(@Body() body: ApontamentoCriar, @Req() req: Request) {
    const { user } = req;

    return await this.apontamentosService.criarApontamentoUsuario(
      body,
      user as number,
    );
  }

  @Patch(':id')
  atualizarApontamento(
    @Body() body: ApontamentoEditar,
    @Req() req: Request,
    @Param() param: { id: string },
  ) {
    const { user } = req;
    const { id } = param;

    return this.apontamentosService.atualizarApontamento(+id, body, +user);
  }

  @Post(':id')
  ativarInativarApontamento(
    @Param() param: { id: string },
    @Req() req: Request,
  ) {
    const { id } = param;
    const user = req.user as number;

    return this.apontamentosService.ativarInativarApontamento(+id, user);
  }
}
