import { Injectable } from '@nestjs/common';

import { ApontamentosService } from '@features/apontamentos/apontamentos.service';
import { QueryPaginacaoApontamento } from '@shared/models/apontamentos/query-paginacao-apontamentos.model';

@Injectable()
export class ProvedoresService {
  constructor(private readonly apontamentosService: ApontamentosService) {}

  async listarApontamentos(
    provedorId: number,
    parametros: QueryPaginacaoApontamento,
  ) {
    return await this.apontamentosService.listarApontamentosProvedor(
      provedorId,
      parametros,
    );
  }
}
