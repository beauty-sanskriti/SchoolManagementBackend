import { Body, Controller, Post } from '@nestjs/common';

import { VerificationService } from './verification.service.js';

@Controller('auth/verification')
export class VerificationController {
  constructor(
    private readonly verificationService: VerificationService,
  ) {}

  @Post('send')
  async sendOtp(
    @Body()
    body: {
      email: string;
      type: 'EMAIL' | 'PHONE';
    },
  ) {
    const verification =
      await this.verificationService.createOtp(
        body.email,
        body.type,
      );

    return {
      message: 'OTP sent successfully',
      type: verification.type,
      expiresAt: verification.expiresAt,
    };
  }

  @Post('verify')
  async verifyOtp(
    @Body()
    body: {
      email: string;
      otp: string;
      type: 'EMAIL' | 'PHONE';
    },
  ) {
    return this.verificationService.verifyOtp(
      body.email,
      body.otp,
      body.type,
    );
  }
}
