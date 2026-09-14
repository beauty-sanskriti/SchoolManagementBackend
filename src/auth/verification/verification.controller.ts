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
      userId: number;
      type: 'EMAIL' | 'PHONE';
    },
  ) {
    const verification = await this.verificationService.createOtp(
      body.userId,
      body.type,
    );

    return {
      message: 'OTP generated successfully',
      otp: verification.otp,
      type: verification.type,
      expiresAt: verification.expiresAt,
    };
  }

  @Post('verify')
  async verifyOtp(
    @Body()
    body: {
      userId: number;
      otp: string;
      type: 'EMAIL' | 'PHONE';
    },
  ) {
    return this.verificationService.verifyOtp(
      body.userId,
      body.otp,
      body.type,
    );
  }
}