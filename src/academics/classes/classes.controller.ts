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

import { ClassesService } from './classes.service.js';

import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
  ) {}

  @Post()
  createClass(
    @Body() dto: CreateClassDto,
    @Request() req: any,
  ) {
    return this.classesService.createClass(
      dto,
      req.user,
    );
  }

  @Get()
  getClasses(
    @Request() req: any,
  ) {
    return this.classesService.getClasses(
      req.user,
    );
  }

  @Get(':id')
  getClass(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.classesService.getClass(
      id,
      req.user,
    );
  }

  @Patch(':id')
  updateClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
    @Request() req: any,
  ) {
    return this.classesService.updateClass(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  deleteClass(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.classesService.deleteClass(
      id,
      req.user,
    );
  }

  // GET /classes/:id/analytics
  @Get(':id/analytics')
  analytics(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.classesService.analytics(id, req.user);
  }
}