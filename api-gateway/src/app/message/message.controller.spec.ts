import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { lastValueFrom, of, throwError } from 'rxjs';
import { MessageController } from './message.controller';

describe('MessageController', () => {
  let controller: MessageController;
  let userService: ClientProxy;
  let messageService: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
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
    }).compile();

    controller = module.get<MessageController>(MessageController);
    userService = module.get<ClientProxy>('USER_SERVICE');
    messageService = module.get<ClientProxy>('MESSAGE_SERVICE');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('getAllMessages', () => {
    it('should get all messages the user', async () => {
      const mocks = jest.spyOn(messageService, 'send');
      const expected = [];

      mocks.mockImplementation(() => of(expected));
      const request = { user: { username: 'testUser1' } };
      expect(
        await lastValueFrom(controller.getAllMessages(request as any)),
      ).toStrictEqual(expected);
    });

    it('should throw internal server exception if error occurs', async () => {
      const mocks = jest.spyOn(messageService, 'send');

      mocks.mockImplementation(() =>
        throwError(() => new Error('unhandled error test')),
      );
      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(controller.getAllMessages(request as any)),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('getMessagesWithUser', () => {
    it('should get messages with the user', async () => {
      const mocks = jest.spyOn(messageService, 'send');
      const expected = [];

      mocks.mockImplementation(() => of(expected));
      const request = { user: { username: 'testUser1' } };
      expect(
        await lastValueFrom(
          await controller.getMessagesWithUser(request as any, 'testUser2'),
        ),
      ).toStrictEqual(expected);
    });

    it('should throw internal server exception if error occurs', async () => {
      const mocks = jest.spyOn(messageService, 'send');

      mocks.mockImplementation(() =>
        throwError(() => new Error('unhandled error test')),
      );
      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(
          await controller.getMessagesWithUser(request as any, 'testUser2'),
        ),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });
  describe('sendMessage', () => {
    it('should send message to existing non blocked user', async () => {
      const expected = 'id123';
      const isUserBlocked = false;
      const userServicMocks = jest.spyOn(userService, 'send');
      userServicMocks.mockImplementation(() => of(isUserBlocked));

      const messageServiceMocks = jest.spyOn(messageService, 'send');
      messageServiceMocks.mockImplementation(() => of(expected));

      const request = { user: { username: 'testUser1' } };
      expect(
        await lastValueFrom(
          await controller.sendMessage(request as any, {
            sender: 'testUser1',
            receiver: 'testUser2',
            message: 'test message',
          }),
        ),
      ).toStrictEqual(expected);
    });

    it('should throw not found error for non existing message receiver', async () => {
      const expected = 'id123';
      const userServicMocks = jest.spyOn(userService, 'send');
      userServicMocks.mockImplementation(() =>
        throwError(() => new NotFoundException()),
      );

      const messageServiceMocks = jest.spyOn(messageService, 'send');
      messageServiceMocks.mockImplementation(() => of(expected));

      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(
          await controller.sendMessage(request as any, {
            sender: 'testUser1',
            receiver: 'nonExistingUser',
            message: 'test message',
          }),
        ),
      ).rejects.toThrowError(NotFoundException);
    });
    it('should throw unhandled exception for user service', async () => {
      const expected = 'id123';
      const userServicMocks = jest.spyOn(userService, 'send');
      userServicMocks.mockImplementation(() =>
        throwError(() => new Error('unhandled exception test')),
      );

      const messageServiceMocks = jest.spyOn(messageService, 'send');
      messageServiceMocks.mockImplementation(() => of(expected));

      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(
          await controller.sendMessage(request as any, {
            sender: 'testUser1',
            receiver: 'nonExistingUser',
            message: 'test message',
          }),
        ),
      ).rejects.toThrowError(InternalServerErrorException);
    });
    it('should throw exception if receiver blocked sender', async () => {
      const expected = 'id123';
      const isBlocked = true;
      const userServicMocks = jest.spyOn(userService, 'send');
      userServicMocks.mockImplementation(() => of(isBlocked));

      const messageServiceMocks = jest.spyOn(messageService, 'send');
      messageServiceMocks.mockImplementation(() => of(expected));

      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(
          await controller.sendMessage(request as any, {
            sender: 'testUser1',
            receiver: 'nonExistingUser',
            message: 'test message',
          }),
        ),
      ).rejects.toThrowError(ForbiddenException);
    });
    it('should catch unhandled exception from message service', async () => {
      const expected = 'id123';
      const isBlocked = false;
      const userServicMocks = jest.spyOn(userService, 'send');
      userServicMocks.mockImplementation(() => of(isBlocked));

      const messageServiceMocks = jest.spyOn(messageService, 'send');
      messageServiceMocks.mockImplementation(() =>
        throwError(() => new Error('unhandled exception test')),
      );

      const request = { user: { username: 'testUser1' } };
      expect(async () =>
        lastValueFrom(
          await controller.sendMessage(request as any, {
            sender: 'testUser1',
            receiver: 'nonExistingUser',
            message: 'test message',
          }),
        ),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
