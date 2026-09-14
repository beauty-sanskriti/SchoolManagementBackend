import { Injectable } from '@nestjs/common';

import { db } from '../../prisma/db.js';

@Injectable()
export class VerificationService {
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOtp(
    userId: number,
    type: 'EMAIL' | 'PHONE',
  ) {
    const otp = this.generateOtp();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    ).toISOString();

    const verification = await db.orm.public.Verification.create({
      userId,
      otp,
      type,
      expiresAt,
      verified: false,
    });

    return verification;
  }

  async verifyOtp(
    userId: number,
    otp: string,
    type: 'EMAIL' | 'PHONE',
  ) {
    const verification = await db.orm.public.Verification
      .where({
        userId,
        otp,
        type,
        verified: false,
      })
      .first();

    if (!verification) {
      return {
        success: false,
        message: 'Invalid OTP',
      };
    }

    if (new Date(verification.expiresAt) < new Date()) {
      return {
        success: false,
        message: 'OTP has expired',
      };
    }

    await db.orm.public.Verification
      .where({ id: verification.id })
      .update({
        verified: true,
      });

    if (type === 'EMAIL') {
      await db.orm.public.User
        .where({ id: userId })
        .update({
          emailVerified: true,
        });
    }

    if (type === 'PHONE') {
      await db.orm.public.User
        .where({ id: userId })
        .update({
          phoneVerified: true,
        });
    }

    return {
      success: true,
      message: `${type} verified successfully`,
    };
  }
}