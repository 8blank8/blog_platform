import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
      console.log(errors)
      const newArr = errors.map(({ property, constraints }) => {
        console.log(Object.keys(constraints))
        return {
          message: 'x',
          field: property
        }
      })
    },
  }))
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(5000);
}
bootstrap();
