import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';

import Knex = require('knex');
import {
  add,
  isBefore,
  formatISO,
  formatRelative,
  sub,
  format,
} from 'date-fns';
import { Request } from 'express';

import { KNEX_CONNECTION } from '@config/knex/knex.token';
import { ApontamentoCriar } from '@shared/models/apontamentos/apontamento-criar.model';
import { ApontamentoEditar } from '@shared/models/apontamentos/apontamento-editar.model';
import { horarioOcupadoException } from '@shared/exceptions/apontamentos/horario-ocupado';
import { dataApontamentoMenorExpection } from '@shared/exceptions/apontamentos/data-apontamento-menor';
import { apontamentoNaoEncontradoException } from '@shared/exceptions/apontamentos/apontamento-nao-encontrado';
import { ApontamentoModel } from '@shared/knex/models/apontamentos/apontamento.model';
import { alteracaoProibidaParaUsuarioDiferenteException } from '@shared/exceptions/apontamentos/alteracao-proibida-usuario';
import { UsuariosService } from '../usuarios/usuarios.service';
import { alteracaoProibidaParaProvedorDiferenteException } from '@shared/exceptions/apontamentos/alteracao-proibida-provedor';
import { usuarioDesejadoNaoProvedorException } from '@shared/exceptions/usuarios/usuario-desejado-nao-provedor';
import { usuarioProvedorIguaisException } from '@shared/exceptions/apontamentos/provedor-usuario-iguais';
import { usuarioNaoEncontradoException } from '@shared/exceptions/usuarios/usuario-nao-encontrado';
import { mudarApontamentoParaOutroUsuarioExpection } from '@shared/exceptions/apontamentos/mudar-para-outro-usuario';
import { bodyVazioException } from '@shared/exceptions/request/body-vazio';
import { apontamentoReturningArray } from '@shared/knex/models/apontamentos/returning-array';
import { TabelasSistema } from '@shared/knex/tables.enum';
import { dataFimMenoDataInicioException } from '@shared/exceptions/apontamentos/data-fim-menor-data-inicio.exception';
import { QueryPaginacaoApontamento } from '@shared/models/apontamentos/query-paginacao-apontamentos.model';

@Injectable()
export class ApontamentosService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly usuariosService: UsuariosService,
  ) {}

  private async listarApontamentosUsuario(
    requestId: number,
    userId: number,
    queryParameters: QueryPaginacaoApontamento,
  ) {
    const usuario = await this.usuariosService.findUserById(userId);

    return { usuario };
  }

  private async listarApontamentosProvedor(
    requestId: number,
    userId: number,
    queryParameters: QueryPaginacaoApontamento,
  ) {
    const usuario = await this.usuariosService.findUserById(userId);

    return { usuario };
  }

  private async encontarApontamentoPeloId(id: number) {
    const [apontamento] = (await this.knex(TabelasSistema.APONTAMENTOS)
      .where({ id })
      .select(apontamentoReturningArray)) as ApontamentoModel[];

    return apontamento;
  }

  private async apontamentoJaMarcadoDiaEHora(
    dados: ApontamentoCriar,
  ): Promise<boolean> {
    const { provedor_id, data_inicio, data_fim } = dados;

    const datasChecagem = {
      inicio: new Date(data_inicio),
      fim: new Date(data_fim),
    };
    try {
      const [inicioInvalido] = await this.knex
        .select('id', 'data_inicio')
        .from(TabelasSistema.APONTAMENTOS)
        .where({ provedor_id })
        .whereBetween('data_inicio', [datasChecagem.inicio, datasChecagem.fim])
        .limit(1);

      const [fimInvalido] = await this.knex
        .select('id', 'data_fim')
        .from(TabelasSistema.APONTAMENTOS)
        .where({ provedor_id })
        .whereBetween('data_fim', [datasChecagem.inicio, datasChecagem.fim])
        .limit(1);

      return !!inicioInvalido || !!fimInvalido;
    } catch (error) {
      throw new HttpException(
        {
          error:
            'Não conseguimos processar sua requisição, por favor, revisar os dados antes de enviar.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private dataMenorQueAtual(data: Date) {
    return isBefore(new Date(data), Date.now());
  }

  private async inativarApontamento(id: number) {
    const dataAtual = formatISO(new Date());

    const [apontamentoCancelado] = (await this.knex(TabelasSistema.APONTAMENTOS)
      .where({ id })
      .update({ canceled_at: dataAtual })
      .returning(apontamentoReturningArray)) as ApontamentoModel[];

    return apontamentoCancelado;
  }

  private async ativarApontamento(id: number) {
    const [apontamento] = (await this.knex(TabelasSistema.APONTAMENTOS)
      .where({ id })
      .update({ canceled_at: null })
      .returning(apontamentoReturningArray)) as ApontamentoModel[];

    return apontamento;
  }

  async criarApontamentoUsuario(
    dados: ApontamentoCriar,
    user: number,
    reqId?: number,
  ) {
    if (Object.keys(dados).length === 0) {
      throw bodyVazioException();
    }

    const [provedor] = (await this.knex(TabelasSistema.USUARIOS)
      .where({ id: dados.provedor_id, is_provider: true })
      .select('id')) as { id: number }[];

    if (!provedor) {
      throw new HttpException(
        { error: 'Provedor não encontrado!' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (reqId && reqId !== provedor.id && reqId !== user) {
      throw new HttpException(
        { error: 'Não é possível criar um apontamento para outro usuário' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (user === provedor.id) {
      throw usuarioProvedorIguaisException();
    }

    if (isBefore(new Date(dados.data_fim), new Date(dados.data_inicio))) {
      throw dataFimMenoDataInicioException();
    }

    if (this.dataMenorQueAtual(dados.data_inicio)) {
      throw dataApontamentoMenorExpection();
    }

    if (await this.apontamentoJaMarcadoDiaEHora(dados)) {
      throw horarioOcupadoException();
    }

    try {
      const [apontamento] = await this.knex(TabelasSistema.APONTAMENTOS)
        // eslint-disable-next-line @typescript-eslint/camelcase
        .insert({ ...dados, user_id: user })
        .returning(['id', 'data_inicio', 'data_fim', 'provedor_id', 'user_id']);

      return apontamento;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async listarApontamentos(
    requestId: number,
    userId: number,
    queryParameters: QueryPaginacaoApontamento,
  ) {
    const usuario = await this.usuariosService.findUserById(userId);

    if (!usuario) {
      throw usuarioNaoEncontradoException();
    }

    const { is_provider } = usuario;

    if (is_provider) {
      // return await this.listarApontamentosProvedor()
    }

    return usuario;

    // const { is_provider, id } = usuario;

    // if (!is_provider) {
    //   return await this.knex
    //     .select(...apontamentoReturningArray)
    //     .from(TabelasSistema.APONTAMENTOS)
    //     .where({ user_id: id, canceled_at: null })
    //     .whereBetween('data', [
    //       formatISO(new Date()),
    //       add(new Date(), { years: 1 }),
    //     ])
    //     .orderBy('data', 'asc');
    // } else {
    //   return await this.knex
    //     .select(...apontamentoReturningArray)
    //     .from(TabelasSistema.APONTAMENTOS)
    //     .where({ provedor_id: id, canceled_at: null })
    //     .whereBetween('data', [
    //       formatISO(new Date()),
    //       add(new Date(), { years: 1 }),
    //     ]);
    // }
  }

  async atualizarApontamento(
    id: number,
    dados: ApontamentoEditar,
    reqId: number,
  ) {
    const { data_inicio, data_fim, provedor_id, user_id } = dados;

    if (Object.keys(dados).length === 0) {
      throw bodyVazioException();
    }

    /* Valida se o apontamento que se deseja alterar existe. */
    const apontamento = await this.encontarApontamentoPeloId(id);

    if (!apontamento) {
      throw apontamentoNaoEncontradoException();
    }

    const {
      user_id: usuarioApontamentoId,
      provedor_id: apontamentoProvedorId,
    } = apontamento;

    /* Verifica se quem enviou a requisição pode realizar as devidas alterações. */

    const requisitanteProvedor = await this.usuariosService.isProvider(reqId);

    if (!requisitanteProvedor) {
      if (reqId !== usuarioApontamentoId) {
        throw alteracaoProibidaParaUsuarioDiferenteException();
      } else if (user_id !== usuarioApontamentoId) {
        throw mudarApontamentoParaOutroUsuarioExpection();
      }
    } else if (requisitanteProvedor && provedor_id !== apontamentoProvedorId) {
      throw alteracaoProibidaParaProvedorDiferenteException();
    }

    /* Verifica se o usuário do apontamento, caso exista, é válido */
    if (user_id && !(await this.usuariosService.findUserById(+user_id))) {
      throw usuarioNaoEncontradoException();
    }

    /* Verifica se o novo provedor, caso exista, é válido. */
    if (provedor_id && !(await this.usuariosService.isProvider(provedor_id))) {
      throw usuarioDesejadoNaoProvedorException();
    }

    if (user_id === provedor_id) {
      throw usuarioProvedorIguaisException();
    }

    /* Verifica se a data, quando existir, é válida. */
    if (data_inicio && data_fim) {
      if (await this.apontamentoJaMarcadoDiaEHora(dados)) {
        throw horarioOcupadoException();
      }

      if (this.dataMenorQueAtual(data_inicio)) {
        throw dataApontamentoMenorExpection();
      }
    }

    try {
      const [novoApontamento] = (await this.knex(TabelasSistema.APONTAMENTOS)
        .update(dados)
        .returning([
          'id',
          'provedor_id',
          'data_incio',
          'data_fim',
          'user_id',
          'canceled_at',
        ])) as Pick<
        ApontamentoModel,
        | 'id'
        | 'provedor_id'
        | 'data_inicio'
        | 'data_fim'
        | 'user_id'
        | 'canceled_at'
      >[];

      return novoApontamento;
    } catch (error) {
      throw new HttpException(
        { error: error.hint },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async ativarInativarApontamento(id: number, reqId: number) {
    const usuario = await this.usuariosService.findUserById(reqId);
    if (!usuario) {
      throw usuarioNaoEncontradoException();
    }

    const apontamento = await this.encontarApontamentoPeloId(id);

    if (!apontamento) {
      throw apontamentoNaoEncontradoException();
    }
    const { is_provider } = usuario;
    const { canceled_at, data_inicio, provedor_id, user_id } = apontamento;

    if (!is_provider && user_id !== reqId) {
      throw alteracaoProibidaParaUsuarioDiferenteException();
    }

    if (is_provider && reqId !== provedor_id) {
      throw alteracaoProibidaParaProvedorDiferenteException();
    }

    if (isBefore(data_inicio, new Date())) {
      throw dataApontamentoMenorExpection();
    }

    try {
      if (!canceled_at) {
        return this.inativarApontamento(id);
      } else {
        return this.ativarApontamento(id);
      }
    } catch (error) {
      throw new HttpException(
        { error: error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
