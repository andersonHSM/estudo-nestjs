import { HttpException, HttpStatus } from '@nestjs/common';

export const provedorInfoInvalidoException = () =>
  new HttpException(
    { error: 'As informações da agenda do provedor estão inválidas.' },
    HttpStatus.BAD_REQUEST,
  );
