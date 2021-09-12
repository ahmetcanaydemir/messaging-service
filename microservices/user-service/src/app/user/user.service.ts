import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './user.model';
import { BlockUserPayload } from './user.payload';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(username: string, password: string) {
    const createdUser = new this.userModel({ username, password });
    await createdUser.save();
    return createdUser.id;
  }

  find(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  async block({ authUsername, blockUsername }: BlockUserPayload) {
    const user = await (await this.find(authUsername)).populate('blocks');
    const blockedUser = await this.find(blockUsername);

    if (!blockedUser) {
      throw new NotFoundException('The user to be blocked could not be found.');
    }

    if (
      !user.blocks.find((user: UserDocument) =>
        user._id.equals(blockedUser._id),
      )
    ) {
      user.blocks.push(blockedUser);
      user.save();
    }
  }
  async checkBlocked({ authUsername, blockUsername }: BlockUserPayload) {
    const user = await (await this.find(authUsername)).populate('blocks');
    const blockedUser = await this.find(blockUsername);

    if (!blockedUser) {
      throw new NotFoundException('The user could not be found.');
    }

    return (
      !!user.blocks.find((user: UserDocument) =>
        user._id.equals(blockedUser._id),
      ) ||
      !!blockedUser.blocks.find((user: UserDocument) =>
        user._id.equals(user._id),
      )
    );
  }
}
