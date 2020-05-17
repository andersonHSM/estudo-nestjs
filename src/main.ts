// eslint-disable-next-line @typescript-eslint/no-unused-vars
import envSelector from 'env-selector';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
