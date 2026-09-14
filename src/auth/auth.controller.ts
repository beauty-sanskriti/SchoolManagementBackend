import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto/register.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // REGISTER
  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto,
    );
  }

  // LOGIN
  @Post('login')
  async login(
    @Body()
    body: {
      login: string;
      password: string;
    },
  ) {
    const result =
      await this.authService.login(
        body.login,
        body.password,
      );

    const refreshToken =
      await this.authService.createRefreshToken(
        result.user.id,
      );

    return {
      ...result,
      refreshToken,
    };
  }

  // LOGOUT
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.authService.logout();
  }

  // FORGOT PASSWORD
  @Post('forgot-password')
  forgotPassword(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.forgotPassword(
      body.email,
    );
  }

  // RESET PASSWORD
  @Post('reset-password')
  resetPassword(
    @Body()
    body: {
      email: string;
      otp: string;
      newPassword: string;
    },
  ) {
    return this.authService.resetPassword(
      body.email,
      body.otp,
      body.newPassword,
    );
  }

  // CHANGE PASSWORD
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req: any,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return this.authService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  // REFRESH TOKEN
  @Post('refresh-token')
  refreshToken(
    @Body()
    body: {
      refreshToken: string;
    },
  ) {
    return this.authService.refreshToken(
      body.refreshToken,
    );
  }
}