import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { lastValueFrom, of, throwError, Observable } from 'rxjs';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: ClientProxy;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
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
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<ClientProxy>('USER_SERVICE');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('blockUser', () => {
    it('should block the user', async () => {
      const mocks = jest.spyOn(userService, 'send');
      const expected = { username: 'testUser1' };

      mocks.mockImplementation(() => of(expected));
      const request = { user: { username: 'testUser1' } };
      expect(
        await controller.blockUser(request as any, 'testUser2'),
      ).toStrictEqual(expected);
    });
    it('should throw not found if user not found', async () => {
      const mocks = jest.spyOn(userService, 'send');

      mocks.mockImplementation(() => throwError(() => new NotFoundException()));
      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(await controller.blockUser(request as any, 'testUser2')),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw internal server exception if error occurs', async () => {
      const mocks = jest.spyOn(userService, 'send');

      mocks.mockImplementation(() =>
        throwError(() => new Error('unhandled error test')),
      );
      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(await controller.blockUser(request as any, 'testUser2')),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
