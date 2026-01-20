import { Controller, Get , Post, Body, Query, UseInterceptors} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';

@Controller('auth-admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Get('captcha')
  // captcha() {
  //   return this.authService.generateCaptcha();
  // }

  @Post('login')
  @UseInterceptors(AnyFilesInterceptor())
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    // @Body('captcha') captcha: string,
    // @Body('captcha_token') captchaToken: string,
  ) {
    return this.authService.login(
      username,
      password,
     // captcha,
     // captchaToken,
    );
  }

  @Post('logout')
  logout() {
    return {
      status: 1,
      message: 'Successfully logged out',
    };
  }

}
