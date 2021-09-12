import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError, TimeoutError } from 'rxjs';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

describe('PassportStrategy', () => {
  let localStrategy: LocalStrategy;
  let jwtStrategy: JwtStrategy;
  let authService: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, JwtStrategy],
      imports: [
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

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<ClientProxy>('AUTH_SERVICE');
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
    expect(jwtStrategy).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('JwtStrategy', () => {
    it('should return user object from payload', async () => {
      const expected = { id: 'id123', username: 'testUser1' };
      const res = await jwtStrategy.validate({
        sub: 'id123',
        username: 'testUser1',
      });
      expect(res).toStrictEqual(expected);
    });
  });

  describe('LocalStrategy', () => {
    it('should validate and return user', async () => {
      const expected = { id: 'id123', username: 'testUser1' };

      const mocks = jest.spyOn(authService, 'send');
      mocks.mockImplementation(() => of(expected));

      const res = await localStrategy.validate('testUser1', 'p@ss');

      expect(res).toStrictEqual(expected);
    });

    it('should throw unauthorized exception if response is null', async () => {
      const mocks = jest.spyOn(authService, 'send');
      mocks.mockImplementation(() => of(null));

      const res = localStrategy.validate('testUser1', 'p@ss');

      expect(res).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw RequestTimeoutException for timeout', async () => {
      const mocks = jest.spyOn(authService, 'send');
      mocks.mockImplementation(() => throwError(() => new TimeoutError()));

      const res = localStrategy.validate('testUser1', 'p@ss');

      expect(res).rejects.toThrowError(RequestTimeoutException);
    });

    it('should throw InternalServerException for unhandled exceptions', async () => {
      const mocks = jest.spyOn(authService, 'send');
      mocks.mockImplementation(() =>
        throwError(() => new Error('unhandled error test')),
      );

      const res = localStrategy.validate('testUser1', 'p@ss');

      expect(res).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
