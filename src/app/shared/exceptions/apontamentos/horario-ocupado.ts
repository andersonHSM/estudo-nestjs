import { HttpException, HttpStatus } from '@nestjs/common';

export const horarioOcupadoException = () =>
  new HttpException(
    { error: 'Provedor já tem compromisso para esse horário.' },
    HttpStatus.BAD_REQUEST,
  );
