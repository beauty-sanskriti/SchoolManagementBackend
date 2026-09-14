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

import { SectionsService } from './sections.service.js';

import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
  ) {}

  @Post()
  createSection(
    @Body() dto: CreateSectionDto,
    @Request() req: any,
  ) {
    return this.sectionsService.createSection(
      dto,
      req.user,
    );
  }

  @Get()
  getSections(
    @Request() req: any,
  ) {
    return this.sectionsService.getSections(
      req.user,
    );
  }

  @Get(':id')
  getSection(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.sectionsService.getSection(
      id,
      req.user,
    );
  }

  @Patch(':id')
  updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
    @Request() req: any,
  ) {
    return this.sectionsService.updateSection(
      id,
      dto,
      req.user,
    );
  }

  @Delete(':id')
  deleteSection(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.sectionsService.deleteSection(
      id,
      req.user,
    );
  }
}