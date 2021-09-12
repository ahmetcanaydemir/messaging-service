import { RpcException } from '@nestjs/microservices';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { UserController } from './user.controller';
import { User } from './user.model';
import { UserService } from './user.service';

const userModel = {
  id: new Types.ObjectId('6138f884297e909dda774a84'),
  username: 'dummy',
  password: 'p@sswrd',
  blocks: [],
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register profile without error', async () => {
      const result = '123a4';

      const mock = jest.spyOn(service, 'create');
      mock.mockImplementation(() => Promise.resolve(result));

      expect(
        await controller.register({ username: 'test', password: 'test' }),
      ).toBe('123a4');
    });

    it('should throw Error with type RpcException if error occurs', async () => {
      const mock = jest.spyOn(service, 'create');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(
        async () =>
          await controller.register({ username: 'test', password: 'test' }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('getUser', () => {
    it('should get user with given username', async () => {
      const result: any = {
        id: '123c',
        username: 'test',
        password: '123',
        blocks: ['123d'],
      };

      const mock = jest.spyOn(service, 'find');
      mock.mockImplementation(() => Promise.resolve(result));

      expect(await controller.getUser({ username: 'test' })).toBe(result);
    });

    it('should throw Error with type RpcException if error occurs', async () => {
      const mock = jest.spyOn(service, 'find');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(
        async () => await controller.getUser({ username: 'test' }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('block', () => {
    it('should block user with given username', async () => {
      const mock = jest.spyOn(service, 'block');
      mock.mockImplementation(() => Promise.resolve());

      expect(
        await controller.blockUser({
          authUsername: 'test',
          blockUsername: 'blockuser',
        }),
      ).toEqual('OK');
    });

    it('should throw Error with type RpcException if error occurs', async () => {
      const mock = jest.spyOn(service, 'block');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(
        async () =>
          await controller.blockUser({
            authUsername: 'test',
            blockUsername: 'blockuser',
          }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('checkBlocked', () => {
    it('should checkBlocked if given user blocked by other user', async () => {
      const mock = jest.spyOn(service, 'checkBlocked');
      mock.mockImplementation(() => Promise.resolve(true));

      expect(
        await controller.checkBlocked({
          authUsername: 'test',
          blockUsername: 'blockuser',
        }),
      ).toBeTruthy();
    });

    it('should throw Error with type RpcException if error occurs', async () => {
      const mock = jest.spyOn(service, 'checkBlocked');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(
        async () =>
          await controller.checkBlocked({
            authUsername: 'test',
            blockUsername: 'blockuser',
          }),
      ).rejects.toThrow(RpcException);
    });
  });
});
