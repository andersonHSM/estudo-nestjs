import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { QueryPaginacaoApontamento } from '@shared/models/apontamentos/query-paginacao-apontamentos.model';
import { ProvedorParams } from '@shared/models/provedores/provedores-params';
import { ProvedoresParams } from '@shared/routes-helpers/provedores-params.enum';
import { VisualizarApontamentosProvedorGuard } from '@shared/guards/visualizar-apontamentos-provedor/visualizar-apontamentos-provedor.guard';
import { ProvedoresService } from './provedores.service';

@Controller('provedores')
export class ProvedoresController {
  constructor(private readonly provedoresService: ProvedoresService) {}
  @UseGuards(VisualizarApontamentosProvedorGuard)
  @Get(`:${ProvedoresParams.PROVEDOR_ID}/apontamentos`)
  async listarApontamentosProvedor(
    @Param() params: ProvedorParams,
    @Query() queryParameters: QueryPaginacaoApontamento,
  ) {
    return await this.provedoresService.listarApontamentos(
      parseInt(params.provedorId, 10),
      queryParameters,
    );
  }
}
