import {
  Body,
  Controller,
  Post,
  Res,
  Patch,
  Param,
  Req,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { UserCreate } from '@shared/models/users/user-create.models';
import { UsuariosService } from './usuarios.service';

import { UserPatch } from '@shared/models/users/user-patch.model';
import { ApontamentosService } from '../apontamentos/apontamentos.service';
import { QueryPaginacaoApontamento } from '@shared/models/apontamentos/query-paginacao-apontamentos.model';
import { UsuariosIguaisGuard } from '@shared/guards/usuarios-iguais/usuarios-iguais.guard';
import { UsuarioRequestExistenteGuard } from '@shared/guards/usuario-request-existente/usuario-request-existente.guard';
import { VisualizarApontamentosUsuarioGuard } from '@shared/guards/visualizar-apontamentos-usuario/visualizar-apontamentos-usuario.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly apontamentosService: ApontamentosService,
  ) {}

  @Post()
  async insertUser(@Body() body: UserCreate, @Res() res: Response) {
    const user = await this.usuariosService.insertUser(body);

    return res.status(200).json(user);
  }

  @Patch(':id')
  async updateUsuarioInfo(
    @Body() body: UserPatch,
    @Param() params: { id: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: paramId } = params;
    const { user: reqId } = req;

    const updatedUser = await this.usuariosService.updateUser(
      paramId,
      reqId.toString(),
      body,
    );

    return res.status(200).json(updatedUser);
  }

  @Post(':userId/apontamentos')
  async inserirApontamentoUsuario(
    @Param() param: { userId: string },
    @Body() dados,
    @Req() req: Request,
  ) {
    const reqId = +req.user;
    const user = +param.userId;
    const apontamento = await this.apontamentosService.criarApontamentoUsuario(
      dados,
      user,
      reqId,
    );

    return apontamento;
  }

  @UseGuards(VisualizarApontamentosUsuarioGuard)
  @Get(':userId/apontamentos/')
  async listarApontamentosUsuario(
    @Param() param: { userId: string },
    @Query() query: QueryPaginacaoApontamento,
  ) {
    const { userId } = param;

    return await this.apontamentosService.listarApontamentos(+userId, query);
  }
}
