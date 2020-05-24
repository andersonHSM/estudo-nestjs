import { HttpException, HttpStatus } from '@nestjs/common';

export const dadosUpdateUsuarioVazioException = () =>
  new HttpException(
    { error: 'Dados para update não podem estar vazios.' },
    HttpStatus.BAD_REQUEST,
  );
