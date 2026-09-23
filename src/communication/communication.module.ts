import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { CommunicationController } from './communication.controller.js';
import { CommunicationService } from './communication.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CommunicationController],
  providers: [CommunicationService],
})
export class CommunicationModule {}
