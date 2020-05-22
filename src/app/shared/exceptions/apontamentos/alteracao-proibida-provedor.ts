import { HttpException, HttpStatus } from '@nestjs/common';

export const alteracaoProibidaParaProvedorDiferenteException = () =>
  new HttpException(
    { error: 'Não é possível alterar o apontamento de outro provedor.' },
    HttpStatus.FORBIDDEN,
  );
