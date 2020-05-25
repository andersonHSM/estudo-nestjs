import { Body, Controller, Post, Res, Patch, Param, Req } from '@nestjs/common';
import { Response, Request } from 'express';

import { UserCreate } from '@shared/models/users/user-create.models';
import { UsuariosService } from './usuarios.service';

import { UserPatch } from '@shared/models/users/user-patch.model';
import { ApontamentosService } from '../apontamentos/apontamentos.service';

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

  @Post(':user_id/apontamentos')
  async inserirApontamentoUsuario(
    @Param() param: { user_id: string },
    @Body() dados,
    @Req() req: Request,
  ) {
    const reqId = +req.user;
    const user = +param.user_id;
    const apontamento = await this.apontamentosService.criarApontamentoUsuario(
      dados,
      user,
      reqId,
    );

    return apontamento;
  }
}
