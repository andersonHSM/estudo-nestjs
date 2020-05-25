import { HttpException, HttpStatus } from '@nestjs/common';

export const usuarioJaExisteException = () =>
  new HttpException(
    { error: 'Usuário já existe na base.' },
    HttpStatus.BAD_REQUEST,
  );
