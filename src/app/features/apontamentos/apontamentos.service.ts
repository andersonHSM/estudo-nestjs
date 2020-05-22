import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import Knex = require('knex');
import { add, sub } from 'date-fns';

import { KNEX_CONNECTION } from '@config/knex/knex.token';
import { ApontamentoCriar } from '@shared/models/apontamentos/apontamento-criar.model';

@Injectable()
export class ApontamentosService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async criar(dados: ApontamentoCriar, user: string) {
    const [provedor] = (await this.knex('usuarios')
      // eslint-disable-next-line @typescript-eslint/camelcase
      .where({ id: dados.provedor_id, is_provider: true })
      .select('id')) as { id: number }[];

    if (!provedor) {
      throw new HttpException(
        { error: 'Provedor não encontrado!' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (+user === provedor.id) {
      throw new HttpException(
        { error: 'Você não pode marcar um apontamento para si mesmo.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      await this.apontamentoJaMarcadoDiaEHora(dados.data, dados.provedor_id)
    ) {
      throw new HttpException(
        { error: 'Provedor já tem compromisso para esse horário.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const [apontamento] = await this.knex('apontamentos')
        // eslint-disable-next-line @typescript-eslint/camelcase
        .insert({ ...dados, user_id: user })
        .returning(['id', 'data', 'provedor_id', 'user_id']);

      console.log(apontamento);
      return apontamento;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async apontamentoJaMarcadoDiaEHora(
    data: Date,
    provedor: number,
  ): Promise<boolean> {
    const novaDataMenoUmaHora = sub(new Date(data), { hours: 1 });
    const novaDataMaisUmaHora = add(new Date(data), { hours: 1 });

    const [apontamentoJaMarcado] = await this.knex('apontamentos')
      .whereBetween('data', [novaDataMenoUmaHora, novaDataMaisUmaHora])
      // eslint-disable-next-line @typescript-eslint/camelcase
      .where({ provedor_id: provedor })
      .select('id');

    if (apontamentoJaMarcado) return true;

    return false;
  }
}
