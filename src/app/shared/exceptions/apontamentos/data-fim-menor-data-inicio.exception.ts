import { HttpException, HttpStatus } from '@nestjs/common';

export const dataFimMenoDataInicioException = () =>
  new HttpException(
    {
      error: 'O fim do apontamento não pode ser marcado para antes do início.',
    },
    HttpStatus.BAD_REQUEST,
  );
