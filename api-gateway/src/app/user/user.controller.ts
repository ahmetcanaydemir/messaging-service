import {
  Controller,
  Inject,
  Param,
  Patch,
  UseGuards,
  Request,
  Req,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { catchError, lastValueFrom, timeout } from 'rxjs';
import { BlockUserPayload } from './user.payload';

@ApiTags('user')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(@Inject('USER_SERVICE') private userService: ClientProxy) {}

  @Patch('block/:username')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Block given username for messaging to authenticated user.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The user has successfully blocked.' })
  @ApiNotFoundResponse({ description: 'The user to block not exists in DB.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  async blockUser(
    @Req() request: Request,
    @Param('username') blockUsername: string,
  ) {
    const blockPayload: BlockUserPayload = {
      authUsername: request['user'].username,
      blockUsername,
    };

    return await lastValueFrom(
      this.userService
        .send('blockUser', blockPayload)
        .pipe(
          catchError((err) => {
            if (err?.status === 404) {
              this.logger.log(
                `${blockPayload.authUsername} tried to block non-existent user ${blockUsername}.`,
              );
              throw new NotFoundException(err.message);
            }
            this.logger.error(err);
            throw new InternalServerErrorException();
          }),
        )
        .pipe(timeout(5000)),
    );
  }
}
