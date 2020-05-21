import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFileFields } from '@shared/models/files/multer-file.model';
import { multerStorage as storage } from '@config/multer/multer.config';
import { AvatarService } from './avatar.service';

@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}
  @UseInterceptors(FileInterceptor('avatar', { storage }))
  @Post('upload')
  async uploadAvatar(@UploadedFile() file: MulterFileFields) {
    const dbFile = await this.avatarService.create(file);

    return dbFile;
  }
}
