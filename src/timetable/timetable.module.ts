import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { TimetableController } from './timetable.controller.js';
import { TimetableService } from './timetable.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
})
export class TimetableModule {}