import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './utils/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  await app.listen(appConfig.port);
}

bootstrap();
