import { HttpException, HttpStatus } from '@nestjs/common';

export const mudarApontamentoParaOutroUsuarioExpection = () =>
  new HttpException(
    { error: 'Não é possível remarcar apontamento para outro usuário.' },
    HttpStatus.FORBIDDEN,
  );
