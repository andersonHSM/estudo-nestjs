import { HttpException, HttpStatus } from '@nestjs/common';

export const credenciaisInvalidException = () =>
  new HttpException(
    { erro: 'Credenciais inválidas. Por favor, tente novamnete' },
    HttpStatus.FORBIDDEN,
  );
