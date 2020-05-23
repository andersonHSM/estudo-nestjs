import { HttpException, HttpStatus } from '@nestjs/common';

export const alteracaoProibidaParaUsuarioDiferenteException = () =>
  new HttpException(
    {
      error:
        'Não é possível alterar ou cancelar o apontamento de outro usuário.',
    },
    HttpStatus.FORBIDDEN,
  );
