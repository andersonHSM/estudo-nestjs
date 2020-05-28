import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  forwardRef,
} from '@nestjs/common';
import * as Knex from 'knex';
import * as Joi from '@hapi/joi';
import { compare, hash } from 'bcrypt';

import { KNEX_CONNECTION } from '@config/knex/knex.token';

import {
  UserCreate,
  ProvedorInfo,
} from '@shared/models/users/user-create.models';
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
import { dadosCriacaoInvalidosException } from '@shared/exceptions/usuarios/dados-criacao-invalidos.exception';
import { usuarioJaExisteException } from '@shared/exceptions/usuarios/usuario-ja-existe.exception';
import { TabelasSistema } from '@shared/knex/tables.enum';
import { AgendaModel } from '@shared/knex/models/agenda/agenda.model';
import { provedorInfoInvalidoException } from '@shared/exceptions/usuarios/provedor-info-invalido.exception';
import { ApontamentosService } from '@features/apontamentos/apontamentos.service';
import { ApontamentoCriar } from '@shared/models/apontamentos/apontamento-criar.model';
import { QueryPaginacaoApontamento } from '@shared/models/apontamentos/query-paginacao-apontamentos.model';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly avatarService: AvatarService,
    @Inject(forwardRef(() => ApontamentosService))
    private readonly apontamentosService: ApontamentosService,
  ) {}
  async isProvider(id: number): Promise<boolean> {
    const [user] = (await this.knex(TabelasSistema.USUARIOS)
      .where({ id, is_provider: true })
      .returning('id')) as { id: number }[];

    return user ? true : false;
  }

  async findUserById(id: number): Promise<UsuarioModel> {
    const [user] = (await this.knex
      .select(...usuarioReturningArray)
      .from(TabelasSistema.USUARIOS)
      .where({ id })) as UsuarioModel[];

    return user;
  }

  async findUserByEmail(email: string): Promise<{ id: number }> {
    const [queryResult] = await this.knex(TabelasSistema.USUARIOS)
      .select('id')
      .where({ email })
      .limit(1);

    return queryResult;
  }

  private async validarSenha(id: number, password: string): Promise<boolean> {
    const [resultadoQuery] = (await this.knex
      .from<UsuarioModel>('usuarios')
      .select('password_hash')
      .where({ id })) as Pick<UsuarioModel, 'password_hash'>[];

    const senhasBatem = await compare(password, resultadoQuery.password_hash);

    return senhasBatem;
  }

  private async gerarPasswordHash(password: string): Promise<string> {
    return await hash(password, 10);
  }

  private async validarDadosInserirUsuario(dados: any): Promise<boolean> {
    const schema = Joi.object({
      nome: Joi.string().required(),
      sobrenome: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().required(),
      is_provider: Joi.boolean(),
      provedor_info: Joi.object(),
    });

    try {
      await schema.validateAsync(dados);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async validarEstruturaProvedorInfo(dados: ProvedorInfo) {
    const horaRegex = /^(\d{2}:){2}\d{2}$/;
    const provedorInfoSchema = Joi.object({
      horario_inicio: Joi.string().regex(horaRegex),
      horario_fim: Joi.string().regex(horaRegex),
      inicio_intervalo: Joi.string().regex(horaRegex),
      fim_intervalo: Joi.string().regex(horaRegex),
    });

    try {
      await provedorInfoSchema.validateAsync(dados);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async cadastrarHorariosProvedor(
    info: ProvedorInfo,
    provedor_id: number,
  ) {
    if (!(await this.validarEstruturaProvedorInfo(info))) {
      throw provedorInfoInvalidoException();
    }

    const [queryReturn] = await this.knex(TabelasSistema.HORARIOS_PROVEDOR)
      .insert({
        ...info,
        provedor_id,
      })
      .returning('*');

    return queryReturn;
  }

  private async atualizarHorariosProvedor(
    dados: ProvedorInfo,
    provedor_id: number,
  ) {
    const schemaValido = await this.validarEstruturaProvedorInfo(dados);
    if (!schemaValido) {
      throw provedorInfoInvalidoException();
    }

    const [retornoQueryHorariosProvedor] = (await this.knex(
      TabelasSistema.HORARIOS_PROVEDOR,
    )
      .where({ provedor_id })
      .update(dados)
      .returning([
        'horario_inicio',
        'horario_fim',
        'inicio_intervalo',
        'fim_intervalo',
      ])) as Pick<
      AgendaModel,
      'horario_fim' | 'horario_inicio' | 'inicio_intervalo' | 'fim_intervalo'
    >[];

    return retornoQueryHorariosProvedor;
  }

  async insertUser(dados: UserCreate): Promise<UserInfoReturn> {
    if (!(await this.validarDadosInserirUsuario(dados))) {
      throw dadosCriacaoInvalidosException();
    }

    const { password, provedor_info, ...dadosIserir } = dados;

    const password_hash = await this.gerarPasswordHash(password);

    if (await this.findUserByEmail(dadosIserir.email)) {
      throw usuarioJaExisteException();
    }

    const [user] = (await this.knex(TabelasSistema.USUARIOS)
      .insert({ ...dadosIserir, password_hash })
      .returning([
        'id',
        'nome',
        'sobrenome',
        'email',
        'is_provider',
      ])) as UserInfoReturn[];

    if (dados.is_provider) {
      await this.cadastrarHorariosProvedor(provedor_info, user.id);
    }

    return user;
  }

  async updateUser(paramId: string, reqId: string, dados: UserPatch) {
    if (Object.keys(dados).length === 0) {
      throw dadosUpdateUsuarioVazioException();
    }

    const user = await this.findUserById(+paramId);
    if (!user) {
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

    const { password, provedor_info, ...dadosAlteracao } = dados;

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

    let retornoUpdateProvedorInfo: ProvedorInfo;
    if (provedor_info) {
      retornoUpdateProvedorInfo = await this.atualizarHorariosProvedor(
        provedor_info,
        +paramId,
      );

      if (!retornoUpdateProvedorInfo) {
        retornoUpdateProvedorInfo = await this.cadastrarHorariosProvedor(
          provedor_info,
          +paramId,
        );
      }
    }

    if (Object.keys(dadosAlteracao).length === 0) {
      const user = await this.findUserById(+paramId);
      return { ...user, provedor_info: retornoUpdateProvedorInfo };
    }
    try {
      return await this.knex(TabelasSistema.USUARIOS)
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

  criarApontamentoUsuario(
    dados: ApontamentoCriar,
    paramUserId: number,
    reqUserId: number,
  ) {
    return this.apontamentosService.criarApontamentoUsuario(
      dados,
      paramUserId,
      reqUserId,
    );
  }

  listarApontamentosUsuario(userId: number, query: QueryPaginacaoApontamento) {
    return this.apontamentosService.listarApontamentosUsuario(userId, query);
  }
}
