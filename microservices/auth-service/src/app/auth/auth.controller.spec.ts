import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

fdescribe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

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
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login', async () => {
      const result = {
        userId: '1',
        accessToken: 'eYToken',
      };

      const mock = jest.spyOn(service, 'login');
      mock.mockImplementation(() => Promise.resolve(result));

      expect(
        await controller.login({ _id: '1', username: 'testUser1' }),
      ).toStrictEqual(result);
    });
  });

  describe('validateUser', () => {
    it('should validate user', async () => {
      const result = {
        userId: '1',
        accessToken: 'eYToken',
      };

      const mock = jest.spyOn(service, 'validateUser');
      mock.mockImplementation(() => Promise.resolve(result));

      expect(
        await controller.validateUser({
          username: 'testUser1',
          password: '123',
        }),
      ).toStrictEqual(result);
    });
  });

  describe('validateToken', () => {
    it('should validate JWT token', async () => {
      const result = {
        userId: '1',
        accessToken: 'eYToken',
      };

      const mock = jest.spyOn(service, 'validateToken');
      mock.mockImplementation(() => Promise.resolve(result));

      expect(await controller.validateToken('eyToken')).toStrictEqual(result);
    });

    it('should return false if error occurs', async () => {
      const mock = jest.spyOn(service, 'validateToken');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(await controller.validateToken('Errr')).toBeFalsy();
    });
  });
});
