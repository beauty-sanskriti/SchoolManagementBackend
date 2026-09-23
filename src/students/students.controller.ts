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

import { StudentsService } from './students.service.js';

import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SCHOOL_ADMIN')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
  ) {}

  @Post()
  createStudent(
    @Body() dto: CreateStudentDto,
    @Request() req: any,
  ) {
    return this.studentsService.createStudent(
      dto,
      req.user,
    );
  }

  @Get()
  getStudents(@Request() req: any) {
    return this.studentsService.getStudents(
      req.user,
    );
  }

  @Get(':id/profile')
  getProfile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getProfile(
      id,
      req.user,
    );
  }

  @Patch(':id/profile')
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentProfileDto,
    @Request() req: any,
  ) {
    return this.studentsService.updateProfile(
      id,
      dto,
      req.user,
    );
  }

  @Get(':id/classes')
  getClasses(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getClasses(
      id,
      req.user,
    );
  }

  @Get(':id/attendance')
  getAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getAttendance(
      id,
      req.user,
    );
  }

  @Get(':id/results')
  getResults(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getResults(
      id,
      req.user,
    );
  }

  @Get(':id/fees')
  getFees(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getFees(
      id,
      req.user,
    );
  }

  @Post(':id/documents')
  addDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.studentsService.addDocument(
      id,
      dto,
      req.user,
    );
  }

  @Get(':id/documents')
  getDocuments(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getDocuments(
      id,
      req.user,
    );
  }

  @Delete(':id/documents/:documentId')
  deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Request() req: any,
  ) {
    return this.studentsService.deleteDocument(
      id,
      documentId,
      req.user,
    );
  }

  @Get(':id')
  getStudent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getStudent(
      id,
      req.user,
    );
  }

  @Patch(':id')
  updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
    @Request() req: any,
  ) {
    return this.studentsService.updateStudent(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  deleteStudent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.deleteStudent(
      id,
      req.user,
    );
  }

  // POST /students/admit
  @Post('admit')
  admitStudent(
    @Body() dto: any,
    @Request() req: any,
  ) {
    return this.studentsService.admitStudent(dto, req.user);
  }

  // POST /students/bulk-import
  @Post('bulk-import')
  bulkImport(
    @Body('students') students: any[],
    @Request() req: any,
  ) {
    return this.studentsService.bulkImport(students, req.user);
  }

  // POST /students/:id/generate-account
  @Post(':id/generate-account')
  generateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.generateAccount(id, req.user);
  }

  // GET /students/:id/id-card
  @Get(':id/id-card')
  getIdCard(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getIdCard(id, req.user);
  }

  // GET /students/:id/lifecycle
  @Get(':id/lifecycle')
  getLifecycle(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.studentsService.getLifecycle(id, req.user);
  }
}