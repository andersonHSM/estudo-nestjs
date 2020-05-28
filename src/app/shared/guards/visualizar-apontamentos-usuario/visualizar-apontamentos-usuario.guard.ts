import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UsuariosService } from '@features/usuarios/usuarios.service';
import { usuarioNaoEncontradoException } from '@shared/exceptions/usuarios/usuario-nao-encontrado';
import { verificarApenasAgendaPropriaException } from '@shared/exceptions/apontamentos/verificar-apenas-agenda-propria.exception';

@Injectable()
export class VisualizarApontamentosUsuarioGuard implements CanActivate {
  constructor(private readonly usuariosService: UsuariosService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user, params } = request;

    const promises = await Promise.all([
      this.usuariosService.findUserById(+params.userId),
      this.usuariosService.findUserById(+user),
    ]);

    const [paramUser, reqUser] = promises;

    if (!paramUser) {
      throw usuarioNaoEncontradoException();
    }

    if (paramUser.id !== reqUser.id) {
      throw verificarApenasAgendaPropriaException();
    }

    return true;
  }
}
