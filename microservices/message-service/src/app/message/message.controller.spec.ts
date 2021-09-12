import { RpcException } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { Types } from 'mongoose';
import { MessageService } from './message.service';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from './message.model';

class messageModel {
  id = new Types.ObjectId('6138f884297e909dda774a84');
  _id = new Types.ObjectId('6138f884297e909dda774a84');
  sender = 'testUser1';
  receiver = 'testUser2';
  message = 'hi there';
  toObject() {
    return this;
  }
}
describe('MessageController', () => {
  let controller: MessageController;
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: messageModel,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send message without error', async () => {
      const result = '123a4id';

      const mock = jest.spyOn(service, 'send');
      mock.mockImplementation(() => Promise.resolve(result));

      expect(
        await controller.sendMessage({
          sender: 'testUser1',
          receiver: 'testUser2',
          message: 'hello!',
        }),
      ).toBe(result);
    });

    it('should throw Error with type RpcException if error occurs', async () => {
      const mock = jest.spyOn(service, 'send');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(
        async () =>
          await controller.sendMessage({
            sender: 'testUser1',
            receiver: 'testUser2',
            message: 'hello!',
          }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('getMessages', () => {
    it('should get messages without error', async () => {
      const expected = [
        {
          ...new messageModel(),
          _id: undefined,
          __v: undefined,
          updatedAt: undefined,
        },
      ];

      const mock = jest.spyOn(service, 'getMessages');
      mock.mockImplementation(() =>
        Promise.resolve([new messageModel() as any]),
      );

      expect(await controller.getMessages('testUser1')).toStrictEqual(expected);
    });

    it('should throw Error with type RpcException if error occurs', async () => {
      const mock = jest.spyOn(service, 'getMessages');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(
        async () => await controller.getMessages('testUser1'),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('getMessagesWithUser', () => {
    it('should get messages without error', async () => {
      const expected = [
        {
          ...new messageModel(),
          _id: undefined,
          __v: undefined,
          updatedAt: undefined,
        },
      ];

      const mock = jest.spyOn(service, 'getMessagesWithUser');
      mock.mockImplementation(() =>
        Promise.resolve([new messageModel() as any]),
      );

      expect(
        await controller.getMessagesWithUser({
          authUsername: 'testUser1',
          otherUsername: 'testUser2',
        }),
      ).toStrictEqual(expected);
    });

    it('should throw Error with type RpcException if error occurs', async () => {
      const mock = jest.spyOn(service, 'getMessagesWithUser');
      mock.mockImplementation(() => {
        throw new Error();
      });

      expect(
        async () =>
          await controller.getMessagesWithUser({
            authUsername: 'testUser1',
            otherUsername: 'testUser2',
          }),
      ).rejects.toThrow(RpcException);
    });
  });
});
