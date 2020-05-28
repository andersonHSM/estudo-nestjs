import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

import { UsuariosService } from '@features/usuarios/usuarios.service';
import { ProvedorParams } from '@shared/models/provedores/provedores-params';
import { verificarApenasAgendaPropriaException } from '@shared/exceptions/apontamentos/verificar-apenas-agenda-propria.exception';

@Injectable()
export class VisualizarApontamentosProvedorGuard implements CanActivate {
  constructor(private readonly usuariosService: UsuariosService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { provedorId: paramProvedorId } = request.params as ProvedorParams;
    const idUsuarioRequisicao = request.user as number;

    const promisesQueryUsuarios = await Promise.all([
      this.usuariosService.findUserById(parseInt(paramProvedorId, 10)),
      this.usuariosService.findUserById(idUsuarioRequisicao),
    ]);

    const [usuarioConsultado, usuarioRequisitante] = promisesQueryUsuarios;

    /* Verifica se o requisitante é um povedor válido. */
    if (!usuarioRequisitante.is_provider) {
      throw new HttpException(
        { error: 'Não é possível acessar a agenda de um provedor.' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (usuarioRequisitante.id !== usuarioConsultado.id) {
      throw verificarApenasAgendaPropriaException();
    }

    return true;
  }
}
