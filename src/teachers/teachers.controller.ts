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

import { TeachersService } from './teachers.service.js';

import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
  ) {}

  @Post()
  createTeacher(
    @Body() dto: CreateTeacherDto,
    @Request() req: any,
  ) {
    return this.teachersService.createTeacher(
      dto,
      req.user,
    );
  }

  @Get()
  getTeachers(@Request() req: any) {
    return this.teachersService.getTeachers(
      req.user,
    );
  }

  @Get(':id/profile')
  getProfile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getProfile(
      id,
      req.user,
    );
  }

  @Get(':id/classes')
  getClasses(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getClasses(
      id,
      req.user,
    );
  }

  @Get(':id/subjects')
  getSubjects(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getSubjects(
      id,
      req.user,
    );
  }

  @Get(':id/timetable')
  getTimetable(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getTimetable(
      id,
      req.user,
    );
  }

  @Get(':id/attendance')
  getAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getAttendance(
      id,
      req.user,
    );
  }

  @Get(':id')
  getTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.getTeacher(
      id,
      req.user,
    );
  }

  @Patch(':id')
  updateTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
    @Request() req: any,
  ) {
    return this.teachersService.updateTeacher(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  deleteTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.teachersService.deleteTeacher(
      id,
      req.user,
    );
  }
}