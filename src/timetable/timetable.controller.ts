import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

import { CreateTimetableDto } from './dto/create-timetable.dto.js';
import { UpdateTimetableDto } from './dto/update-timetable.dto.js';
import { TimetableService } from './timetable.service.js';

@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class TimetableController {
  constructor(
    private readonly timetableService: TimetableService,
  ) {}

  @Post()
  createTimetable(
    @Body() dto: CreateTimetableDto,
    @Request() req: any,
  ) {
    return this.timetableService.createTimetable(
      dto,
      req.user,
    );
  }

  @Get()
  getTimetables(@Request() req: any) {
    return this.timetableService.getTimetables(
      req.user,
    );
  }

  @Get('students/:id/timetable')
  getStudentTimetable(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.timetableService.getStudentTimetable(
      id,
      req.user,
    );
  }

  @Get(':id')
  getTimetable(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.timetableService.getTimetable(
      id,
      req.user,
    );
  }

  @Patch(':id')
  updateTimetable(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimetableDto,
    @Request() req: any,
  ) {
    return this.timetableService.updateTimetable(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  deleteTimetable(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.timetableService.deleteTimetable(
      id,
      req.user,
    );
  }
}