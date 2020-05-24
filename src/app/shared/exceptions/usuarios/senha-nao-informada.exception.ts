import { HttpException, HttpStatus } from '@nestjs/common';

export const senhaNaoInformadaException = () =>
  new HttpException(
    { error: 'Por favor, informe sua senha para continuar.' },
    HttpStatus.BAD_REQUEST,
  );
