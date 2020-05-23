import { HttpException, HttpStatus } from '@nestjs/common';

export const dataApontamentoMenorExpection = () =>
  new HttpException(
    {
      error: 'A data do apontamento não pode ser anterior ao horário atual.',
    },
    HttpStatus.BAD_REQUEST,
  );
