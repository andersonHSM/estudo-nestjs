import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { KNEX_CONNECTION } from '@config/knex/knex.token';
import Knex = require('knex');
import { MulterFileFields } from '@shared/models/files/multer-file.model';
import { TabelasSistema } from '@shared/knex/tables.enum';

@Injectable()
export class AvatarService {
  constructor(@Inject(KNEX_CONNECTION) private knex: Knex) {}

  async acharAvatarPeloId(id: number) {
    const [retornoQuery] = (await this.knex
      .select('id')
      .from(TabelasSistema.ARQUIVOS)
      .where({ id })) as { id: number }[];

    return retornoQuery;
  }

  async create(file: MulterFileFields) {
    const { filename, path } = file;
    try {
      const file = await this.knex(TabelasSistema.ARQUIVOS)
        .insert({ name: filename, path })
        .returning(['id', 'name', 'path']);

      return file;
    } catch (err) {
      throw new HttpException(
        { err: 'Problema ao inserir arquivo. Tente novamente' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
