import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { lastValueFrom, of, throwError } from 'rxjs';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: ClientProxy;
  let authService: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        ClientsModule.register([
          {
            name: 'USER_SERVICE',
            transport: Transport.REDIS,
            options: {
              retryAttempts: 5,
              retryDelay: 1000,
              url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/`,
            },
          },
        ]),
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
        ]),
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<ClientProxy>('USER_SERVICE');
    authService = module.get<ClientProxy>('AUTH_SERVICE');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login', async () => {
      const mocks = jest.spyOn(authService, 'send');
      const expected = { userId: 'id234', accessToken: 'eyToken' };

      mocks.mockImplementation(() => of(expected));
      const request = { user: { username: 'testUser1' } };
      expect(
        await lastValueFrom(controller.login(request as any)),
      ).toStrictEqual(expected);
    });

    it('should throw internal server exception if error occurs', async () => {
      const mocks = jest.spyOn(authService, 'send');

      mocks.mockImplementation(() =>
        throwError(() => new Error('unhandled error test')),
      );
      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(controller.login(request as any)),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('register', () => {
    it('should register without error', async () => {
      const mocks = jest.spyOn(userService, 'send');
      const expected = 'id234';

      mocks.mockImplementation(() => of(expected));
      controller.register({ username: 'newUser', password: '123' });

      expect(mocks).toBeCalled();
    });
    it('should throw conflict exception for already existing username', async () => {
      const mocks = jest.spyOn(userService, 'send');

      mocks.mockImplementation(() =>
        throwError(() => ({
          // MongoDB duplicate key error code
          code: 11000,
        })),
      );

      expect(() =>
        controller.register({ username: 'existingUser', password: '123' }),
      ).rejects.toThrowError(ConflictException);
    });

    it('should throw bad request exception if there are validation error', async () => {
      const mocks = jest.spyOn(userService, 'send');

      mocks.mockImplementation(() =>
        throwError(() => ({
          name: 'ValidationError',
        })),
      );

      expect(() =>
        controller.register({ username: 'newUser', password: '' }),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should throw internal server exception for unhandled error', async () => {
      const mocks = jest.spyOn(userService, 'send');

      mocks.mockImplementation(() =>
        throwError(() => new Error('unhandled error')),
      );

      expect(() =>
        controller.register({ username: 'newUser', password: '123' }),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
