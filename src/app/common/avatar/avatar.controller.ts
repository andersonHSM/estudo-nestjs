import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFileFields } from '@shared/models/files/multer-file.model';
import { multerStorage as storage } from '@config/multer/multer.config';

@Controller('avatar')
export class AvatarController {
  @UseInterceptors(FileInterceptor('avatar', { storage }))
  @Post('upload')
  async uploadAvatar(@UploadedFile() file: MulterFileFields) {
    return file;
  }
}
