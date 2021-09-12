import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisUri = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/`;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url: redisUri,
    },
  });

  app.startAllMicroservices();
}
bootstrap();
