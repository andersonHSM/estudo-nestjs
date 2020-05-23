import { HttpException, HttpStatus } from '@nestjs/common';

export const alteracaoProibidaParaProvedorDiferenteException = () =>
  new HttpException(
    {
      error:
        'Não é possível alterar ou cancelar o apontamento de outro provedor.',
    },
    HttpStatus.FORBIDDEN,
  );
