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
import { CreateSchoolAdminDto } from './dto/create-school-admin.dto.js';
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

  @Post()
  createSchool(
    @Body() createSchoolDto: CreateSchoolDto,
  ) {
    return this.schoolsService.createSchool(
      createSchoolDto,
    );
  }

  @Post(':id/admin')
  createSchoolAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() createSchoolAdminDto: CreateSchoolAdminDto,
  ) {
    return this.schoolsService.createSchoolAdmin(
      id,
      createSchoolAdminDto,
    );
  }

  @Get()
  getSchools() {
    return this.schoolsService.getSchools();
  }

  @Get(':id/users')
  getSchoolUsers(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchoolUsers(id);
  }

  @Get(':id/students')
  getSchoolStudents(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchoolStudents(id);
  }

  @Get(':id/teachers')
  getSchoolTeachers(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchoolTeachers(id);
  }

  @Patch(':id/status')
  updateSchoolStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolStatusDto: UpdateSchoolStatusDto,
  ) {
    return this.schoolsService.updateSchoolStatus(
      id,
      updateSchoolStatusDto,
    );
  }

  // GET /schools/:id/settings
  getSchool(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.getSchool(id);
  }

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

  @Delete(':id')
  deleteSchool(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schoolsService.deleteSchool(id);
  }
}