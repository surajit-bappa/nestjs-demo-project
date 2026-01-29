import { Controller, Get , Post, Body, Query, UseInterceptors} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @Post('check-credentials')
  @UseInterceptors(AnyFilesInterceptor())
  async checkCredentials(@Body() body: any) {
    const { username, emp_no, dob } = body;
    return this.authService.checkCredentials(username, emp_no, dob);
  }

  @Post('reset-password')
   @UseInterceptors(AnyFilesInterceptor())
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
    @UseInterceptors(AnyFilesInterceptor())
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  @Post('logout')
  logout() {
    return {
      status: 1,
      message: 'Successfully logged out',
    };
  }

}
