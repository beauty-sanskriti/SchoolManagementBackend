import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SecurityController } from './security.controller.js';
import { SecurityService } from './security.service.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
})
export class SecurityModule {}
