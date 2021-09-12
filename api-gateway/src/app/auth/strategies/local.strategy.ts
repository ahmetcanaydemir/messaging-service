import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  Logger,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  catchError,
  lastValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);
  constructor(@Inject('AUTH_SERVICE') private authService: ClientProxy) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await lastValueFrom(
      this.authService.send('validateUser', { username, password }).pipe(
        timeout(5000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            return throwError(() => new RequestTimeoutException());
          }
          return throwError(() => err);
        }),
      ),
    );

    if (!user) {
      this.logger.log(`Invalid username or password entered for ${username}`);
      throw new UnauthorizedException('Invalid username or password');
    }

    return user;
  }
}
