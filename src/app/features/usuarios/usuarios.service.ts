import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import * as Knex from 'knex';
import * as Joi from '@hapi/joi';
import { compare, hash } from 'bcrypt';
import { add, setHours, startOfHour, getHours } from 'date-fns';

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
    const [queryResult] = await this.knex('usuarios')
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

  private async validarDadosInserirUsuario(dados: any) {
    const schema = Joi.object({
      nome: Joi.string().required(),
      sobrenome: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().required(),
      is_provider: Joi.boolean(),
      provedor_info: Joi.object(),
    });

    return await schema.validateAsync(dados);
  }

  private async cadastrarHorariosProvedor(info: ProvedorInfo) {
    const [horaInicio] = info.horario_inicio.split(':');
    const [horaFim] = info.horario_fim.split(':');
    const [horaInicioIntervalo] = info.inicio_intervalo.split(':');
    const [horaFimIntervalo] = info.fim_intervalo.split(':');

    const horasAtendimento =
      parseInt(horaInicioIntervalo) -
      parseInt(horaInicio) +
      parseInt(horaFim) -
      parseInt(horaFimIntervalo);

    const conversoresParaSegundos = {
      minutes: (minutos: number) => minutos * 60,
      hours: (horas: number) => horas * 60 * 60,
    };

    const {
      tempo: tempoApontamento,
      unidade: unidadeApontamento,
    } = info.duracao_media_apontamento;

    const segundosPorAtendimento = conversoresParaSegundos[unidadeApontamento](
      tempoApontamento,
    );
    const segundosTotalDeAtendimento = conversoresParaSegundos['hours'](
      horasAtendimento,
    );
    const totalAtendimentosDiarios =
      segundosTotalDeAtendimento / segundosPorAtendimento;

    const montarAgenda = (
      horaInicio: number,
      horaInicioIntervalo: number,
      horaFimIntervalo: number,
      horaFim: number,
      tempo: number,
      unidade: string,
    ) => {
      const adding = {};
      adding[unidade] = tempo;

      let horario = startOfHour(setHours(new Date(), +horaInicio));

      let horariosArray = [];

      let horaAtual = horaInicio;

      while (horaAtual <= horaFim) {
        const horaFormatada = horario.toLocaleTimeString();

        let [hora] = horaFormatada.split(':');
        if (+hora === horaInicioIntervalo) {
          horario = setHours(horario, horaFimIntervalo);
        }

        horario = add(horario, adding);
        horariosArray = horariosArray.concat(horaFormatada);

        horaAtual++;
      }

      console.log(horariosArray);

      // for (let index = 0; index < quantidade; index++) {
      //   let horario
      //   horario = add(horario, { ...(adding as Duration) });
      // }
    };

    montarAgenda(
      +horaInicio,
      +horaInicioIntervalo,
      +horaFimIntervalo,
      +horaFim,
      info.duracao_media_apontamento.tempo,
      info.duracao_media_apontamento.unidade,
    );
  }

  async insertUser(dados: UserCreate): Promise<UserInfoReturn[]> {
    try {
      await this.validarDadosInserirUsuario(dados);
    } catch (error) {
      throw dadosCriacaoInvalidosException();
    }

    const { password, ...dadosIserir } = dados;

    const password_hash = await this.gerarPasswordHash(password);

    if (await this.findUserByEmail(dadosIserir.email)) {
      console.log(await this.findUserByEmail(dadosIserir.email));
      throw usuarioJaExisteException();
    }

    if (dados.is_provider) {
      await this.cadastrarHorariosProvedor(dados.provedor_info);
    }

    return [null];
    // return await this.knex('usuarios')
    //   .insert({ ...dadosIserir, password_hash })
    //   .returning(['id', 'nome', 'sobrenome', 'email', 'is_provider']);
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
