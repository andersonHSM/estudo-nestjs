import { ApontamentoModel } from './apontamento.model';

export type ApontamentoCriar = Pick<ApontamentoModel, 'data' | 'provedor_id'>;
