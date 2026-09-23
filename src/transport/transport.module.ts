import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { TransportController } from './transport.controller.js';
import { TransportService } from './transport.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [TransportController],
  providers: [TransportService],
})
export class TransportModule {}
