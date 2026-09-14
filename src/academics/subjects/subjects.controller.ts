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

import { SubjectsService } from './subjects.service.js';

import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
  ) {}

  @Post()
  createSubject(
    @Body() dto: CreateSubjectDto,
    @Request() req: any,
  ) {
    return this.subjectsService.createSubject(
      dto,
      req.user,
    );
  }

  @Get()
  getSubjects(
    @Request() req: any,
  ) {
    return this.subjectsService.getSubjects(
      req.user,
    );
  }

  @Get(':id')
  getSubject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.subjectsService.getSubject(
      id,
      req.user,
    );
  }

  @Patch(':id')
  updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
    @Request() req: any,
  ) {
    return this.subjectsService.updateSubject(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  deleteSubject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.subjectsService.deleteSubject(
      id,
      req.user,
    );
  }
}