import { HttpException, HttpStatus } from '@nestjs/common';

export const dadosCriacaoInvalidosException = () =>
  new HttpException(
    { error: 'Dados informados inválidos.' },
    HttpStatus.BAD_REQUEST,
  );
