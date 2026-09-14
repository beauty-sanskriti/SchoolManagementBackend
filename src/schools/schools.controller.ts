import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SchoolsService } from './schools.service.js';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { UpdateSchoolStatusDto } from './dto/update-school-status.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
  ) {}

  // POST /schools
  @Post()
  createSchool(
    @Body() createSchoolDto: CreateSchoolDto,
  ) {
    return this.schoolsService.createSchool(
      createSchoolDto,
    );
  }

  // GET /schools
  @Get()
  getSchools() {
    return this.schoolsService.getSchools();
  }

  // GET /schools/:id/users
  @Get(':id/users')
  getSchoolUsers(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchoolUsers(id);
  }

  // GET /schools/:id/students
  @Get(':id/students')
  getSchoolStudents(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchoolStudents(id);
  }

  // GET /schools/:id/teachers
  @Get(':id/teachers')
  getSchoolTeachers(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchoolTeachers(id);
  }

  // PATCH /schools/:id/status
  @Patch(':id/status')
  updateSchoolStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateSchoolStatusDto: UpdateSchoolStatusDto,
  ) {
    return this.schoolsService.updateSchoolStatus(
      id,
      updateSchoolStatusDto,
    );
  }

  // GET /schools/:id
  @Get(':id')
  getSchool(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchool(id);
  }

  // PATCH /schools/:id
  @Patch(':id')
  updateSchool(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.schoolsService.updateSchool(
      id,
      updateSchoolDto,
    );
  }

  // DELETE /schools/:id
  @Delete(':id')
  deleteSchool(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.deleteSchool(id);
  }
}