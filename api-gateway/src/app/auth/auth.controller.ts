import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { catchError, lastValueFrom, timeout } from 'rxjs';
import { LoginRegisterPayload } from '../user/user.payload';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('USER_SERVICE') private userService: ClientProxy,
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user.' })
  @ApiCreatedResponse({ description: 'The user has successfully registered.' })
  @ApiConflictResponse({ description: 'Username already taken.' })
  @ApiBadRequestResponse({
    description: 'Username and/or password not entered.',
  })
  async register(@Body() newUser: LoginRegisterPayload) {
    await lastValueFrom(
      this.userService
        .send<string>('register', newUser)
        .pipe(
          catchError((err) => {
            if (err?.code === 11000) {
              this.logger.log(
                `Registration attempt for an already existing user: ${newUser.username}`,
              );
              throw new ConflictException(
                'This username is already taken. Please choose another name.',
              );
            } else if (err?.name == 'ValidationError') {
              this.logger.log(`Validation error`, err);
              throw new BadRequestException(
                'Please make sure you have entered both username and password.',
              );
            }
            this.logger.error('Unhandled exception:', err);
            throw new InternalServerErrorException();
          }),
        )
        .pipe(timeout(5000)),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Get JWT token for given credentials.' })
  @ApiOkResponse({
    description: 'Successful login.',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password.' })
  @ApiBody({ type: LoginRegisterPayload })
  login(@Request() req) {
    return this.authService
      .send('login', req.user)
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw new InternalServerErrorException();
        }),
      )
      .pipe(timeout(5000));
  }
}
