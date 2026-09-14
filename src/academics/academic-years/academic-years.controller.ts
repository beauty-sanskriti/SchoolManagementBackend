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

import { AcademicYearsService } from './academic-years.service.js';

import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('academic-years')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class AcademicYearsController {

  constructor(
    private readonly academicYearsService: AcademicYearsService,
  ) {}

  // POST /academic-years
  @Post()
  createAcademicYear(
    @Body()
    createAcademicYearDto: CreateAcademicYearDto,
    @Request() req: any,
  ) {
    return this.academicYearsService.createAcademicYear(
      createAcademicYearDto,
      req.user,
    );
  }

  // GET /academic-years
  @Get()
  getAcademicYears(
    @Request() req: any,
  ) {
    return this.academicYearsService.getAcademicYears(
      req.user,
    );
  }

  // GET /academic-years/:id
  @Get(':id')
  getAcademicYear(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.academicYearsService.getAcademicYear(
      id,
      req.user,
    );
  }

  // PATCH /academic-years/:id
  @Patch(':id')
  updateAcademicYear(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateAcademicYearDto: UpdateAcademicYearDto,
    @Request() req: any,
  ) {
    return this.academicYearsService.updateAcademicYear(
      id,
      updateAcademicYearDto,
      req.user,
    );
  }

  // DELETE /academic-years/:id
  @Delete(':id')
  deleteAcademicYear(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.academicYearsService.deleteAcademicYear(
      id,
      req.user,
    );
  }
}