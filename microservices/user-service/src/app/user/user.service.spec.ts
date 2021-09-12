import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './user.model';
import { UserService } from './user.service';
import { MongoError } from 'mongodb';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  class mockUserModel {
    _id = this;
    id: string;
    username: string;
    password: string;
    blocks: mockUserModel[];
    constructor(dto: any) {
      this.id = dto.id;
      this.username = dto.username;
      this.password = dto.password;
      this.blocks = dto.blocks || [];
    }
    save() {
      if (!this.id) {
        this.id = (mockUserModel.db.length + 1).toString();
      }
      if (this.username === 'alreadyExistsUser') {
        throw new MongoError('Already exists error');
      }
      const dbRecordIndex = mockUserModel.db.findIndex(
        (x) => x.username === this.username,
      );
      if (dbRecordIndex === -1) mockUserModel.db.push(this);
      else mockUserModel.db[dbRecordIndex] = this;
      return this;
    }
    exec() {
      if (this.username === null) {
        return null;
      }
      return this;
    }
    populate() {
      return this;
    }

    equals(user: mockUserModel) {
      return user.id === this.id;
    }
    static db = [];
    static findOne = ({ username }: { username: string }) => {
      return (
        mockUserModel.db.find((x) => x.username === username) ||
        new mockUserModel({ username: null })
      );
    };
  }

  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new user', async () => {
      const expectedId = (mockUserModel.db.length + 1).toString();
      expect(await service.create('test', '123')).toBe(expectedId);
    });
    it('should throw error for existing user', async () => {
      expect(
        async () => await service.create('alreadyExistsUser', '123'),
      ).rejects.toThrowError(MongoError);
    });
  });

  describe('find', () => {
    it('should return user', async () => {
      expect((await service.find('test')).username).toBe('test');
    });
  });

  describe('block', () => {
    it('should block user', async () => {
      let userSrc = new mockUserModel({ username: 'userSrc' }).save();
      const userDst = new mockUserModel({ username: 'userDst' }).save();
      await service.block({
        authUsername: userSrc.username,
        blockUsername: userDst.username,
      });
      await service.block({
        authUsername: userSrc.username,
        blockUsername: userDst.username,
      });
      userSrc = mockUserModel.findOne({ username: 'userSrc' });
      const blockedUserCount = userSrc.blocks.filter(
        (x) => x.username === 'userDst',
      ).length;
      expect(blockedUserCount).toBe(1);
    });

    it('should throw exception for block non existing user', async () => {
      expect(
        async () =>
          await service.block({
            authUsername: 'userSrc',
            blockUsername: 'nonExistingUsername',
          }),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('checkBlocked', () => {
    it('should check is user blocked or not', async () => {
      const blockedUserResult = await service.checkBlocked({
        authUsername: 'userSrc',
        blockUsername: 'userDst',
      });
      const notBlockedUserResult = await service.checkBlocked({
        authUsername: 'userSrc',
        blockUsername: 'test',
      });
      expect(blockedUserResult).toBe(true);
      expect(notBlockedUserResult).toBe(false);
    });

    it('should throw exception for check block status with non existing user', async () => {
      expect(
        async () =>
          await service.checkBlocked({
            authUsername: 'userSrc',
            blockUsername: 'nonExistingUsername',
          }),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
