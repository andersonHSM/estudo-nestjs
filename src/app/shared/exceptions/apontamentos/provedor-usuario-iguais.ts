import { HttpException, HttpStatus } from '@nestjs/common';

export const usuarioProvedorIguaisException = () =>
  new HttpException(
    { error: 'Usuário e provedor não podem ser iguais.' },
    HttpStatus.BAD_REQUEST,
  );
