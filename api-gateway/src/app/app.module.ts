import { Module } from '@nestjs/common';
import { Transport, ClientsModule } from '@nestjs/microservices';
import { UserController } from './user/user.controller';
import { MessageController } from './message/message.controller';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { AuthController } from './auth/auth.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.REDIS,
        options: {
          retryAttempts: 5,
          retryDelay: 1000,
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/`,
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.REDIS,
        options: {
          retryAttempts: 5,
          retryDelay: 1000,
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/`,
        },
      },
      {
        name: 'MESSAGE_SERVICE',
        transport: Transport.REDIS,
        options: {
          retryAttempts: 5,
          retryDelay: 1000,
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/`,
        },
      },
    ]),
  ],
  controllers: [AuthController, MessageController, UserController],
  providers: [LocalStrategy, JwtStrategy],
})
export class AppModule {}
