import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UsuariosService } from '@features/usuarios/usuarios.service';
import { usuarioNaoEncontradoException } from '@shared/exceptions/usuarios/usuario-nao-encontrado';

@Injectable()
export class UsuarioRequestExistenteGuard implements CanActivate {
  constructor(private readonly usuariosService: UsuariosService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { params } = request;

    console.log(params);

    if (!(await this.usuariosService.findUserById(+params.userId))) {
      throw usuarioNaoEncontradoException();
    }
    return true;
  }
}
