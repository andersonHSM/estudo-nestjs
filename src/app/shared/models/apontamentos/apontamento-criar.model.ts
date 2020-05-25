import { ApontamentoModel } from '../../knex/models/apontamentos/apontamento.model';

export type ApontamentoCriar = Pick<
  ApontamentoModel,
  'data_inicio' | 'data_fim' | 'provedor_id'
>;
