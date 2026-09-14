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

import { DepartmentsService } from './departments.service.js';

import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class DepartmentsController {

  constructor(
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Post()
  createDepartment(
    @Body() dto: CreateDepartmentDto,
    @Request() req: any,
  ) {
    return this.departmentsService.createDepartment(
      dto,
      req.user,
    );
  }

  @Get()
  getDepartments(
    @Request() req: any,
  ) {
    return this.departmentsService.getDepartments(
      req.user,
    );
  }

  @Get(':id')
  getDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.departmentsService.getDepartment(
      id,
      req.user,
    );
  }

  @Patch(':id')
  updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
    @Request() req: any,
  ) {
    return this.departmentsService.updateDepartment(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  deleteDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.departmentsService.deleteDepartment(
      id,
      req.user,
    );
  }
}