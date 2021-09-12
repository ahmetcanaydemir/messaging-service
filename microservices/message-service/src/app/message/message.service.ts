import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Message, MessageDocument } from './message.model';
import {
  GetMessageWithUserPayload,
  SendMessagePayload,
} from './message.payload';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async send(messagePayload: SendMessagePayload) {
    const newMessage = new this.messageModel(messagePayload);
    await newMessage.save();
    return newMessage.id;
  }

  getMessages(authUsername: string) {
    return this.messageModel
      .find({
        $or: [
          { sender: { $eq: authUsername } },
          { receiver: { $eq: authUsername } },
        ],
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessagesWithUser(payload: GetMessageWithUserPayload) {
    return this.messageModel
      .find({
        $or: [
          {
            $and: [
              { sender: { $eq: payload.authUsername } },
              { receiver: { $eq: payload.otherUsername } },
            ],
          },
          {
            $and: [
              { sender: { $eq: payload.authUsername } },
              { receiver: { $eq: payload.otherUsername } },
            ],
          },
        ],
      })
      .sort({ updatedAt: -1 })
      .exec();
  }
}
