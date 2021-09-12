import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Message } from './message.model';
import { MessageService } from './message.service';

fdescribe('MessageService', () => {
  class mockMessageModel {
    id: string;
    receiver: string;
    sender: string;
    message: string;
    constructor(dto: any) {
      this.id = dto.id;
      this.receiver = dto.receiver;
      this.sender = dto.sender;
      this.message = dto.message;
    }
    save() {
      if (!this.id) {
        this.id = (mockMessageModel.db.length + 1).toString();
      }
      const dbRecordIndex = mockMessageModel.db.findIndex(
        (x) => x.sender === this.sender,
      );
      if (dbRecordIndex === -1) mockMessageModel.db.push(this);
      else mockMessageModel.db[dbRecordIndex] = this;
      return this;
    }

    equals(user: mockMessageModel) {
      return user.id === this.id;
    }
    static db = [];
    static find = () => {
      const Messages = function () {
        this.items = mockMessageModel.db;
      };
      Messages.prototype.sort = function () {
        return this;
      };
      Messages.prototype.exec = function () {
        return this.items;
      };
      return new Messages();
    };
  }
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should send message', async () => {
      const expectedId = (mockMessageModel.db.length + 1).toString();
      expect(
        await service.send({
          sender: 'testUser1',
          receiver: 'testUser2',
          message: 'test',
        }),
      ).toBe(expectedId);
    });
  });

  describe('getMessages', () => {
    it('should get messages of users', async () => {
      const expected = [
        {
          id: '1',
          sender: 'testUser1',
          receiver: 'testUser2',
          message: 'test',
        },
      ];
      expect(await service.getMessages('testUser1')).toEqual(expected);
    });
  });

  describe('getMessagesWithUser', () => {
    it('should get messages of users with other user', async () => {
      const expected = [
        {
          id: '1',
          sender: 'testUser1',
          receiver: 'testUser2',
          message: 'test',
        },
      ];
      expect(
        await service.getMessagesWithUser({
          authUsername: 'testUser1',
          otherUsername: 'testUser2',
        }),
      ).toEqual(expected);
    });
  });
});
