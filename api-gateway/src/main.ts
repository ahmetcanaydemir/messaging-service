import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Messaging Service')
    .setDescription('API for messaging service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'API Docs for Messaging Service',
  };
  SwaggerModule.setup('', app, document, customOptions);

  await app.listen(3000);
}
bootstrap();
