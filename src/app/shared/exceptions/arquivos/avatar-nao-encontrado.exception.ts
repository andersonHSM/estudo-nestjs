import { HttpException, HttpStatus } from '@nestjs/common';

export const avatarNaoEncontradoException = () =>
  new HttpException({ error: 'Avatar não encontrado.' }, HttpStatus.NOT_FOUND);
