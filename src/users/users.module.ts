import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UserCodeService } from './user-code.service.js';
import { TwoFactorService } from './two-factor.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCodeService,
    TwoFactorService,
  ],
  exports: [UserCodeService, TwoFactorService],
})
export class UsersModule {}
