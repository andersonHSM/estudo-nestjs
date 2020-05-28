import { HttpException, HttpStatus } from '@nestjs/common';

export const verificarApenasAgendaPropriaException = () =>
  new HttpException(
    { error: 'É possível verificar apenas a sua agenda.' },
    HttpStatus.FORBIDDEN,
  );
