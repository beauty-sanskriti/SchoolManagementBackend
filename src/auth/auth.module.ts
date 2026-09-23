import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';
import { RolesGuard } from './roles.guard.js';
import { VerificationController } from './verification/verification.controller.js';
import { VerificationService } from './verification/verification.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'school-management-secret',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  controllers: [
    AuthController,
    VerificationController,
  ],

  providers: [
    AuthService,
    VerificationService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],

  exports: [
    PassportModule,
    JwtModule,
    JwtAuthGuard,
    RolesGuard,
    VerificationService,
  ],
})
export class AuthModule {}