import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { db } from '../prisma/db.js';
import { RegisterDto } from './dto/register.dto/register.dto.js';
import { VerificationService } from './verification/verification.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register(registerDto: RegisterDto) {
    const existingUser = await db.orm.public.User
      .where({
        email: registerDto.email,
      })
      .first();

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    const existingPhone = await db.orm.public.User
      .where({
        phone: registerDto.phone,
      })
      .first();

    if (existingPhone) {
      throw new ConflictException(
        'Phone number is already registered',
      );
    }

    if (registerDto.username) {
      const existingUsername =
        await db.orm.public.User
          .where({
            username: registerDto.username,
          })
          .first();

      if (existingUsername) {
        throw new ConflictException(
          'Username is already registered',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      10,
    );

    const user = await db.orm.public.User.create({
      schoolId: registerDto.schoolId,
      email: registerDto.email,
      phone: registerDto.phone,
      username: registerDto.username,
      name: registerDto.name,
      password: hashedPassword,
      role: 'STUDENT',
      emailVerified: false,
      phoneVerified: false,
    });

    const phoneVerification =
      await this.verificationService.createOtp(
        user.id,
        'PHONE',
      );

    const emailVerification =
      await this.verificationService.createOtp(
        user.id,
        'EMAIL',
      );

    return {
      message:
        'Registration successful. Please verify your email and phone.',

      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        name: user.name,
        role: user.role,
      },

      developmentOtp: {
        phone: phoneVerification.otp,
        email: emailVerification.otp,
      },
    };
  }

  // =========================
  // LOGIN
  // =========================

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

    if (
      !user.emailVerified ||
      !user.phoneVerified
    ) {
      throw new UnauthorizedException(
        'Please verify your email and phone first',
      );
    }

    const payload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      tokenType: 'access',
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

  // =========================
  // LOGOUT
  // =========================

  async logout() {
    return {
      message: 'Logout successful',
    };
  }

  // =========================
  // FORGOT PASSWORD
  // =========================

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
        user.id,
        'EMAIL',
      );

    return {
      message:
        'Password reset OTP generated successfully',
      developmentOtp: verification.otp,
      expiresAt: verification.expiresAt,
    };
  }

  // =========================
  // RESET PASSWORD
  // =========================

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

  // =========================
  // CHANGE PASSWORD
  // =========================

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

  // =========================
  // REFRESH TOKEN
  // =========================

  async refreshToken(
    refreshToken: string,
  ) {
    try {
      const payload =
        await this.jwtService.verifyAsync<{
          sub: number;
          schoolId: number;
          role: string;
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
          schoolId: payload.schoolId,
          role: payload.role,
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

  // =========================
  // CREATE REFRESH TOKEN
  // =========================

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

    return this.jwtService.signAsync(
      {
        sub: user.id,
        schoolId: user.schoolId,
        role: user.role,
        tokenType: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    );
  }
}