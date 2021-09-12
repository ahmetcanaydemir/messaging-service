import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import {
  GetMessageWithUserPayload,
  SendMessagePayload,
} from './message.payload';
import { MessageService } from './message.service';

@Controller()
export class MessageController {
  constructor(private messageService: MessageService) {}

  @MessagePattern('sendMessage')
  async sendMessage(messagePayload: SendMessagePayload) {
    try {
      return await this.messageService.send(messagePayload);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('getMessages')
  async getMessages(authUsername: string) {
    try {
      return (await this.messageService.getMessages(authUsername)).map(
        (message) => ({
          id: message._id,
          ...message.toObject(),
          updatedAt: undefined,
          _id: undefined,
          __v: undefined,
        }),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('getMessagesWithUser')
  async getMessagesWithUser(payload: GetMessageWithUserPayload) {
    try {
      return (await this.messageService.getMessagesWithUser(payload)).map(
        (message) => ({
          id: message._id,
          ...message.toObject(),
          updatedAt: undefined,
          _id: undefined,
          __v: undefined,
        }),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
