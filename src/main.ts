import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import envSelector from 'env-selector';

async function bootstrap() {
  envSelector();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
