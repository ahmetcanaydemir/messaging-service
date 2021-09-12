import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { of, throwError, TimeoutError } from 'rxjs';
import { hashSync } from 'bcryptjs';
import { RequestTimeoutException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
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
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<ClientProxy>('USER_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login', async () => {
      const result = 'eYToken';
      const expected = {
        userId: '1',
        accessToken: result,
      };

      const mock = jest.spyOn(jwtService, 'sign');
      mock.mockImplementation(() => result);

      expect(
        await service.login({ _id: '1', username: 'testUser1' }),
      ).toStrictEqual(expected);
    });
  });

  describe('validate token', () => {
    it('should validate token', async () => {
      const expected = { _id: '1', username: 'testUser1' };

      const mock = jest.spyOn(jwtService, 'verify');
      mock.mockImplementation(() => expected);

      expect(await service.validateToken('eYToken')).toStrictEqual(expected);
    });
  });
  describe('validate user', () => {
    it('should validate user', async () => {
      const hashedPass = hashSync('123', 12);
      const mocks = jest.spyOn(userService, 'send');
      mocks.mockImplementation(() =>
        of({ username: 'testUser1', password: hashedPass }),
      );
      const expected = { username: 'testUser1', password: hashedPass };

      expect(await service.validateUser('testUser1', '123')).toStrictEqual(
        expected,
      );
    });
    it('should return null if pass not correct', async () => {
      const hashedPass = hashSync('123', 12);
      const mocks = jest.spyOn(userService, 'send');
      mocks.mockImplementation(() =>
        of({ username: 'testUser1', password: hashedPass }),
      );

      expect(
        await service.validateUser('testUser1', 'incorrectPass'),
      ).toBeNull();
    });
    it('should throw error if a problem occurs', async () => {
      const mocks = jest.spyOn(userService, 'send');
      mocks.mockImplementation(() => {
        throw new Error('Err Occured Succesfully');
      });

      expect(
        async () => await service.validateUser('testUser1', 'correctPass'),
      ).rejects.toThrow();
    });
    it('should throw timeout error if timout occurs', async () => {
      const mocks = jest.spyOn(userService, 'send');
      mocks.mockImplementation(() => throwError(() => new TimeoutError()));

      expect(
        async () => await service.validateUser('testUser1', 'correctPass'),
      ).rejects.toThrowError(RequestTimeoutException);
    });
    it('should catch errors from service', async () => {
      const mocks = jest.spyOn(userService, 'send');
      mocks.mockImplementation(() => throwError(() => new Error('test error')));

      expect(
        async () => await service.validateUser('testUser1', 'correctPass'),
      ).rejects.toThrow();
    });
  });
});
