import { HttpException, HttpStatus } from '@nestjs/common';

export const apontamentoNaoEncontradoException = () =>
  new HttpException(
    { error: 'Apontamento não encontrado.' },
    HttpStatus.NOT_FOUND,
  );
