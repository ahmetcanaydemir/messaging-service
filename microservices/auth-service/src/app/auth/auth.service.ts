import {
  Injectable,
  Inject,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError } from 'rxjs/operators';
import { TimeoutError, throwError, lastValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject('USER_SERVICE')
    private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await lastValueFrom(
        this.userService.send('getUser', { username }).pipe(
          timeout(5000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(() => new RequestTimeoutException());
            }
            return throwError(() => err);
          }),
        ),
      );

      if (user?.password && (await compare(password, user.password))) {
        return user;
      }

      return null;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async login(user) {
    const payload = { username: user.username, sub: user._id };

    return {
      userId: user._id,
      accessToken: this.jwtService.sign(payload),
    };
  }

  validateToken(jwt: string) {
    return this.jwtService.verify(jwt);
  }
}
