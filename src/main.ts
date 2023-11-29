import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

import { HttpExceptionFilter } from './exception.filter';
import { AppModule } from './app.module';
import { TelegramAdapter } from '@utils/adapters/telegram.adapter';

global.appRoot = __dirname

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = errors.map(({ property, constraints }) => {
          if (constraints) {
            return {
              message: constraints[Object.keys(constraints)[0]],
              field: property,
            };
          }
        });

        throw new BadRequestException(errorMessages);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const telegramAdapter = await app.resolve(TelegramAdapter)
  await telegramAdapter.setWebhook('https://a1cccac0067e8dd33ef1aab550014e0a.serveo.net')

  await app.listen(5001);
}
bootstrap();
