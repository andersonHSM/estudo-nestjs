import { HttpException, HttpStatus } from '@nestjs/common';

export const usuarioNaoEncontradoException = () =>
  new HttpException({ error: 'Usuário não encontrado!' }, HttpStatus.NOT_FOUND);
