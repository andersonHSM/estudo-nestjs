import { ApontamentoModel } from '../../knex/models/apontamentos/apontamento.model';

export type ApontamentoCriar = Pick<ApontamentoModel, 'data' | 'provedor_id'>;
