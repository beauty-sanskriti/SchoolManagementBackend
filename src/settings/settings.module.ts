import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
