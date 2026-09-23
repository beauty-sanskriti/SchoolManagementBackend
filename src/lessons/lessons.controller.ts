import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { LmsService } from '../lms/lms.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
export class LessonsController {
  constructor(private readonly lmsService: LmsService) {}

  @Patch(':id')
  updateLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.lmsService.updateLesson(id, dto);
  }

  @Delete(':id')
  deleteLesson(@Param('id', ParseIntPipe) id: number) {
    return this.lmsService.deleteLesson(id);
  }
}
