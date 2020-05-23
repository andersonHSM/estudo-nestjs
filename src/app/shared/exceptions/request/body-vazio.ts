import { HttpException, HttpStatus } from '@nestjs/common';

export const bodyVazioException = () =>
  new HttpException(
    { error: 'Body não pode estar vazio.' },
    HttpStatus.BAD_REQUEST,
  );
