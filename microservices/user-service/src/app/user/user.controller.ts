import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import {
  BlockUserPayload,
  GetUserPayload,
  RegisterUserPayload,
} from './user.payload';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}
  @MessagePattern('register')
  async register({ username, password }: RegisterUserPayload) {
    try {
      return await this.userService.create(username, password);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('getUser')
  async getUser({ username }: GetUserPayload) {
    try {
      return await this.userService.find(username);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('blockUser')
  async blockUser(blockUserPayload: BlockUserPayload) {
    try {
      this.userService.block(blockUserPayload);
      return 'OK';
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('checkBlocked')
  async checkBlocked(blockUserPayload: BlockUserPayload) {
    try {
      return await this.userService.checkBlocked(blockUserPayload);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
