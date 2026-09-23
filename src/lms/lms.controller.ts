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

import { LmsService } from './lms.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  createCourse(@Body() dto: any, @Request() req: any) {
    return this.lmsService.createCourse(dto, req.user);
  }

  @Get()
  getCourses(@Request() req: any) {
    return this.lmsService.getCourses(req.user);
  }

  @Get(':id')
  getCourse(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.lmsService.getCourse(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.lmsService.updateCourse(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  deleteCourse(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.lmsService.deleteCourse(id, req.user);
  }

  @Post(':id/lessons')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  createLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.lmsService.createLesson(id, dto, req.user);
  }

  @Get(':id/lessons')
  getLessons(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.lmsService.getLessons(id, req.user);
  }

  @Post(':id/resources')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  addResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.lmsService.addResource(id, dto, req.user);
  }

  @Post(':id/quizzes')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  createQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.lmsService.createQuiz(id, dto, req.user);
  }

  @Get(':id/quizzes')
  getQuizzes(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.lmsService.getQuizzes(id, req.user);
  }

  @Post(':id/enroll')
  enroll(
    @Param('id', ParseIntPipe) id: number,
    @Body('studentId', ParseIntPipe) studentId: number,
    @Request() req: any,
  ) {
    return this.lmsService.enroll(id, studentId, req.user);
  }

  @Get(':id/students')
  getCourseStudents(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.lmsService.getCourseStudents(id, req.user);
  }
}
