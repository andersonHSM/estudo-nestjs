import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import Knex = require('knex');
import { add, sub, isBefore, formatISO } from 'date-fns';

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
import { usuarioReturningArray } from '@shared/knex/models/usuarios/returning-array';
import { TabelasSistema } from '@shared/knex/tables.enum';

@Injectable()
export class ApontamentosService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly usuariosService: UsuariosService,
  ) {}

  private async encontarApontamentoPeloId(id: number) {
    const [apontamento] = (await this.knex(TabelasSistema.APONTAMENTOS)
      .where({ id })
      .select(apontamentoReturningArray)) as ApontamentoModel[];

    return apontamento;
  }

  private async apontamentoJaMarcadoDiaEHora(
    data: Date,
    provedor: number,
  ): Promise<boolean> {
    const horaAnterior = sub(new Date(data), { minutes: 59 });
    const proximaHora = add(new Date(data), { minutes: 59 });

    const [apontamentoJaMarcado] = await this.knex(TabelasSistema.APONTAMENTOS)
      .whereBetween('data', [horaAnterior, proximaHora])
      // eslint-disable-next-line @typescript-eslint/camelcase
      .where({ provedor_id: provedor })
      .select('id');

    if (apontamentoJaMarcado) return true;

    return false;
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

  async criar(dados: ApontamentoCriar, user: string) {
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

    if (+user === provedor.id) {
      throw usuarioProvedorIguaisException();
    }

    if (this.dataMenorQueAtual(dados.data)) {
      throw dataApontamentoMenorExpection();
    }

    if (
      await this.apontamentoJaMarcadoDiaEHora(dados.data, dados.provedor_id)
    ) {
      throw horarioOcupadoException();
    }

    try {
      const [apontamento] = await this.knex(TabelasSistema.APONTAMENTOS)
        // eslint-disable-next-line @typescript-eslint/camelcase
        .insert({ ...dados, user_id: user })
        .returning(['id', 'data', 'provedor_id', 'user_id']);

      return apontamento;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async listarApontamentos(reqId: number) {
    const usuario = await this.usuariosService.findUserById(reqId);
    const { is_provider, id } = usuario;

    if (!is_provider) {
      return await this.knex
        .select(...apontamentoReturningArray)
        .from(TabelasSistema.APONTAMENTOS)
        .where({ user_id: id, canceled_at: null })
        .whereBetween('data', [
          formatISO(new Date()),
          add(new Date(), { years: 1 }),
        ])
        .orderBy('data', 'asc');
    } else {
      return await this.knex
        .select(...apontamentoReturningArray)
        .from(TabelasSistema.APONTAMENTOS)
        .where({ provedor_id: id, canceled_at: null })
        .whereBetween('data', [
          formatISO(new Date()),
          add(new Date(), { years: 1 }),
        ]);
    }
  }

  async atualizarApontamento(
    id: number,
    dados: ApontamentoEditar,
    reqId: number,
  ) {
    const { data, provedor_id, user_id } = dados;

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
    if (data) {
      if (await this.apontamentoJaMarcadoDiaEHora(data, provedor_id)) {
        throw horarioOcupadoException();
      }

      if (this.dataMenorQueAtual(data)) {
        throw dataApontamentoMenorExpection();
      }
    }

    try {
      const [novoApontamento] = (await this.knex(TabelasSistema.APONTAMENTOS)
        .update(dados)
        .returning([
          'id',
          'provedor_id',
          'data',
          'user_id',
          'canceled_at',
        ])) as Pick<
        ApontamentoModel,
        'id' | 'provedor_id' | 'data' | 'user_id' | 'canceled_at'
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
    const { canceled_at, data, provedor_id, user_id } = apontamento;

    if (!is_provider && user_id !== reqId) {
      throw alteracaoProibidaParaUsuarioDiferenteException();
    }

    if (is_provider && reqId !== provedor_id) {
      throw alteracaoProibidaParaProvedorDiferenteException();
    }

    if (isBefore(data, new Date())) {
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
