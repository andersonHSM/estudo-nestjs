import { HttpException, HttpStatus } from '@nestjs/common';

export const usuarioDesejadoNaoProvedorException = () =>
  new HttpException(
    { error: 'Usuário selecionado não é um provedor de serviço válido.' },
    HttpStatus.BAD_REQUEST,
  );
