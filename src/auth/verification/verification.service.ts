import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { BrevoClient } from '@getbrevo/brevo';

import { db } from '../../prisma/db.js';

@Injectable()
export class VerificationService {
  private readonly brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY || '',
  });

  generateOtp(): string {
    return Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
  }

  async createOtp(
    email: string,
    type: 'EMAIL' | 'PHONE',
  ) {
    if (type !== 'EMAIL') {
      throw new BadRequestException(
        'Only email OTP is currently supported',
      );
    }

    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = this.generateOtp();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    ).toISOString();

    const verification =
      await db.orm.public.Verification.create({
        userId: user.id,
        otp,
        type,
        expiresAt,
        verified: false,
      });

    try {
      await this.brevo.transactionalEmails.sendTransacEmail({
        sender: {
          email:
            process.env.BREVO_FROM_EMAIL || '',
          name:
            process.env.BREVO_FROM_NAME ||
            'School Management',
        },
        to: [
          {
            email: user.email,
            name: user.name || undefined,
          },
        ],
        subject: 'School Management - Email Verification',
        htmlContent: `
          <div>
            <h2>Verify Your Email</h2>
            <p>Your verification OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP will expire in 10 minutes.</p>
            <p>Please do not share this OTP with anyone.</p>
          </div>
        `,
      });
    } catch {
      await db.orm.public.Verification
        .where({ id: verification.id })
        .delete();

      throw new BadRequestException(
        'Failed to send verification email',
      );
    }

    return verification;
  }

  async verifyOtp(
    email: string,
    otp: string,
    type: 'EMAIL' | 'PHONE',
  ) {
    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const verification =
      await db.orm.public.Verification
        .where({
          userId: user.id,
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

    if (
      new Date(verification.expiresAt) <
      new Date()
    ) {
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
        .where({ id: user.id })
        .update({
          emailVerified: true,
        });
    }

    if (type === 'PHONE') {
      await db.orm.public.User
        .where({ id: user.id })
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
