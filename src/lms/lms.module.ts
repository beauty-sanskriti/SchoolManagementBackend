import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { LmsController } from './lms.controller.js';
import { LmsService } from './lms.service.js';
import { LessonsController } from '../lessons/lessons.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [LmsController, LessonsController],
  providers: [LmsService],
})
export class LmsModule {}
