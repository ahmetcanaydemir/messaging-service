import { Controller, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('login')
  async login(user) {
    return this.authService.login(user);
  }

  @MessagePattern('validateUser')
  async validateUser(user) {
    return this.authService.validateUser(user.username, user.password);
  }

  @MessagePattern('validateToken')
  async validateToken(jwt) {
    try {
      const res = this.authService.validateToken(jwt);

      return res;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
