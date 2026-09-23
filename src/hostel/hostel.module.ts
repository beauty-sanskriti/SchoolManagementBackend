import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { HostelController } from './hostel.controller.js';
import { HostelService } from './hostel.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [HostelController],
  providers: [HostelService],
})
export class HostelModule {}
