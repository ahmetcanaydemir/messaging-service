import {
  Controller,
  Inject,
  Param,
  UseGuards,
  Request,
  Req,
  Get,
  Post,
  Body,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { catchError, lastValueFrom, timeout } from 'rxjs';
import { BlockUserPayload } from '../user/user.payload';
import {
  GetMessageWithUserPayload,
  MessageResponse,
  SendMessagePayload,
} from './message.payload';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    @Inject('MESSAGE_SERVICE') private messageService: ClientProxy,
    @Inject('USER_SERVICE') private userService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get all messages of authenticated user' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'List of messages of between authenticated user and other users.',
    type: [MessageResponse],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  getAllMessages(@Req() request: Request) {
    return this.messageService
      .send('getMessages', request['user'].username)
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw new InternalServerErrorException();
        }),
      )
      .pipe(timeout(5000));
  }

  @Get(':username')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get messages between authenticated user and given user',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'List of messages of between authenticated user and given user.',
    type: [MessageResponse],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  async getMessagesWithUser(
    @Req() request: Request,
    @Param('username') username: string,
  ) {
    const payload: GetMessageWithUserPayload = {
      authUsername: request['user'].username,
      otherUsername: username,
    };

    return this.messageService
      .send('getMessagesWithUser', payload)
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw new InternalServerErrorException();
        }),
      )
      .pipe(timeout(5000));
  }

  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Send message from authenticated user to given user',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Message sended successfully.',
    schema: {
      type: 'string',
      example: '613a29143f3ee85b7b4ad9e1',
      description: 'Id of the newly created message.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Authenticated user blocked by receiver user.',
  })
  @ApiNotFoundResponse({
    description: 'Receiver username not found in DB.',
  })
  async sendMessage(
    @Req() request: Request,
    @Body() { receiver, message }: SendMessagePayload,
  ) {
    const blockUserPayload: BlockUserPayload = {
      authUsername: request['user'].username,
      blockUsername: receiver,
    };

    const userIsBlocked = await lastValueFrom(
      this.userService
        .send('checkBlocked', blockUserPayload)
        .pipe(
          catchError((err) => {
            if (err?.status === 404) {
              this.logger.log(
                `${blockUserPayload.authUsername} tried sending message to non-existent user ${receiver}.`,
              );
              throw new NotFoundException(err.message);
            }
            throw new InternalServerErrorException();
          }),
        )
        .pipe(timeout(5000)),
    );
    if (userIsBlocked) {
      this.logger.log(
        `${blockUserPayload.authUsername} tried sending message as blocked from the user ${receiver}.`,
      );
      throw new ForbiddenException(
        'The message could not be sent because you have been blocked by the target user or you blocked the target user.',
      );
    }

    const sendMessagePayload: SendMessagePayload = {
      sender: request['user'].username,
      receiver,
      message,
    };

    return this.messageService
      .send('sendMessage', sendMessagePayload)
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw new InternalServerErrorException();
        }),
      )
      .pipe(timeout(5000));
  }
}
