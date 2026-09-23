import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
