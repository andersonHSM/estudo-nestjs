import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsuariosService } from 'src/app/features/usuarios/usuarios.service';
import { Request } from 'express';
import { verificarApenasAgendaPropriaException } from '@shared/exceptions/apontamentos/verificar-apenas-agenda-propria.exception';

@Injectable()
export class UsuariosIguaisGuard implements CanActivate {
  constructor(private readonly usuariosService: UsuariosService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { params, user: requestId } = request;
    const userId = params.userId;

    return this.checarUsuarioProvedorIguais(+userId, +requestId);
  }

  private async checarUsuarioProvedorIguais(
    paramUserId: number,
    requestId: number,
  ) {
    const usuarioRequest = await this.usuariosService.findUserById(requestId);
    const usuarioParemetro = await this.usuariosService.findUserById(
      paramUserId,
    );

    /* Verifica se os usuários existem e apenas permite que o provedor verifique sua agenda. */
    if (usuarioParemetro && usuarioRequest && usuarioRequest.is_provider) {
      if (usuarioRequest.id !== usuarioParemetro.id) {
        throw verificarApenasAgendaPropriaException();
      }
    } else {
      if (usuarioParemetro.id !== usuarioRequest.id) {
        throw verificarApenasAgendaPropriaException();
      }
    }

    return true;
  }
}
