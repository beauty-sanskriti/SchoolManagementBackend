import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { db } from '../prisma/db.js';
import { VerificationService } from './verification/verification.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    login: string,
    password: string,
  ) {
    const userByEmail =
      await db.orm.public.User
        .where({
          email: login,
        })
        .first();

    let user = userByEmail;

    if (!user) {
      user =
        await db.orm.public.User
          .where({
            username: login,
          })
          .first();
    }

    if (!user) {
      user =
        await db.orm.public.User
          .where({
            phone: login,
          })
          .first();
    }

    if (!user) {
      throw new UnauthorizedException(
        'Invalid login credentials',
      );
    }

    const passwordMatched =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatched) {
      throw new UnauthorizedException(
        'Invalid login credentials',
      );
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email first',
      );
    }

    let studentId: number | undefined;

    if (user.role === 'STUDENT') {
      const student = await db.orm.public.Student
        .where({
          userId: user.id,
        })
        .first();

      studentId = student?.id;
    }

    const payload = {
      sub: user.id,
      ...(user.schoolId !== null && {
        schoolId: user.schoolId,
      }),
      role: user.role,
      tokenType: 'access',
      ...(studentId !== undefined && {
        studentId,
      }),
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    const {
      password: _,
      ...userWithoutPassword
    } = user;

    return {
      message: 'Login successful',
      accessToken,
      user: userWithoutPassword,
    };
  }

  async logout() {
    return {
      message: 'Logout successful',
    };
  }

  async forgotPassword(email: string) {
    const user =
      await db.orm.public.User
        .where({
          email,
        })
        .first();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const verification =
      await this.verificationService.createOtp(
        user.email,
        'EMAIL',
      );

    return {
      message:
        'Password reset OTP sent successfully',
      expiresAt: verification.expiresAt,
    };
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    const user =
      await db.orm.public.User
        .where({
          email,
        })
        .first();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const verification =
      await db.orm.public.Verification
        .where({
          userId: user.id,
          otp,
          type: 'EMAIL',
          verified: false,
        })
        .first();

    if (!verification) {
      throw new UnauthorizedException(
        'Invalid password reset OTP',
      );
    }

    if (
      new Date(verification.expiresAt) <
      new Date()
    ) {
      throw new UnauthorizedException(
        'Password reset OTP has expired',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10,
      );

    await db.orm.public.User
      .where({
        id: user.id,
      })
      .update({
        password: hashedPassword,
      });

    await db.orm.public.Verification
      .where({
        id: verification.id,
      })
      .update({
        verified: true,
      });

    return {
      message:
        'Password reset successfully',
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user =
      await db.orm.public.User
        .where({
          id: userId,
        })
        .first();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const passwordMatched =
      await bcrypt.compare(
        currentPassword,
        user.password,
      );

    if (!passwordMatched) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password,
      );

    if (samePassword) {
      throw new ConflictException(
        'New password must be different from current password',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10,
      );

    await db.orm.public.User
      .where({
        id: userId,
      })
      .update({
        password: hashedPassword,
      });

    return {
      message:
        'Password changed successfully',
    };
  }

  async refreshToken(
    refreshToken: string,
  ) {
    try {
      const payload =
        await this.jwtService.verifyAsync<{
          sub: number;
          schoolId?: number;
          role: string;
          studentId?: number;
          tokenType?: string;
        }>(refreshToken);

      if (
        payload.tokenType !== 'refresh'
      ) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      const newAccessToken =
        await this.jwtService.signAsync({
          sub: payload.sub,
          ...(payload.schoolId !== undefined && {
            schoolId: payload.schoolId,
          }),
          role: payload.role,
          ...(payload.studentId !== undefined && {
            studentId: payload.studentId,
          }),
          tokenType: 'access',
        });

      return {
        message:
          'Access token refreshed successfully',
        accessToken: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }
  }

  async createRefreshToken(
    userId: number,
  ) {
    const user =
      await db.orm.public.User
        .where({
          id: userId,
        })
        .first();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    let studentId: number | undefined;

    if (user.role === 'STUDENT') {
      const student = await db.orm.public.Student
        .where({
          userId: user.id,
        })
        .first();

      studentId = student?.id;
    }

    return this.jwtService.signAsync(
      {
        sub: user.id,
        ...(user.schoolId !== null && {
          schoolId: user.schoolId,
        }),
        role: user.role,
        ...(studentId !== undefined && {
          studentId,
        }),
        tokenType: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    );
  }
}