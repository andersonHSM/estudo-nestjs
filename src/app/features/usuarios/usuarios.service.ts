import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import * as Knex from 'knex';
import { compare } from 'bcrypt';

import { KNEX_CONNECTION } from '@config/knex/knex.token';

import { UserCreate } from '@shared/models/users/user-create.models';
import { UserInfoReturn } from '@shared/models/users/user-info-return.model';
import { UserPatch } from '@shared/models/users/user-patch.model';
import { UsuarioModel } from '@shared/knex/models/usuarios/usuario.model';
import { usuarioReturningArray } from '@shared/knex/models/usuarios/returning-array';
import { dadosUpdateUsuarioVazioException } from '@shared/exceptions/usuarios/dados-update-vazio.exception';
import { senhaNaoInformadaException } from '@shared/exceptions/usuarios/senha-nao-informada.exception';
import { credenciaisInvalidException } from '@shared/exceptions/usuarios/credenciais-invalidas.exception';
import { usuarioNaoEncontradoException } from '@shared/exceptions/usuarios/usuario-nao-encontrado';
import { AvatarService } from '@common/avatar/avatar.service';
import { avatarNaoEncontradoException } from '@shared/exceptions/arquivos/avatar-nao-encontrado.exception';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly avatarService: AvatarService,
  ) {}
  async isProvider(id: number): Promise<boolean> {
    const [user] = (await this.knex('usuarios')
      .where({ id, is_provider: true })
      .returning('id')) as { id: number }[];

    return user ? true : false;
  }

  async findUserById(id: number): Promise<UsuarioModel> {
    const [user] = (await this.knex
      .select(...usuarioReturningArray)
      .from('usuarios')
      .where({ id })) as UsuarioModel[];

    return user;
  }

  async findUserByEmail(email: string): Promise<{ id: number }[]> {
    return await this.knex('usuarios')
      .select('id')
      .where({ email })
      .limit(1);
  }

  async validarSenha(id: number, password: string): Promise<boolean> {
    const [resultadoQuery] = (await this.knex
      .from<UsuarioModel>('usuarios')
      .select('password_hash')
      .where({ id })) as Pick<UsuarioModel, 'password_hash'>[];

    const senhasBatem = await compare(password, resultadoQuery.password_hash);

    return senhasBatem;
  }

  async insertUser(data: UserCreate): Promise<UserInfoReturn[]> {
    return await this.knex('usuarios')
      .insert(data)
      .returning(['id', 'nome', 'sobrenome', 'email', 'is_provider']);
  }

  async updateUser(paramId: string, reqId: string, dados: UserPatch) {
    if (Object.keys(dados).length === 0) {
      throw dadosUpdateUsuarioVazioException();
    }

    if (!(await this.findUserById(+paramId))) {
      throw usuarioNaoEncontradoException();
    }

    if (paramId !== reqId) {
      throw new HttpException(
        {
          error: `Não é possível alterar as informações de outros usuários..`,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const { password, ...dadosAlteracao } = dados;

    if (!password) {
      throw senhaNaoInformadaException();
    }

    const senhaValida = await this.validarSenha(+paramId, password);

    if (!senhaValida) {
      throw credenciaisInvalidException();
    }

    if (
      dadosAlteracao.avatar_id &&
      !(await this.avatarService.acharAvatarPeloId(dadosAlteracao.avatar_id))
    ) {
      throw avatarNaoEncontradoException();
    }

    try {
      return await this.knex('usuarios')
        .where({ id: paramId })
        .update(dadosAlteracao)
        .returning([
          'id',
          'nome',
          'sobrenome',
          'email',
          'avatar_id',
          'is_provider',
        ]);
    } catch (error) {
      throw new HttpException({ error }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
