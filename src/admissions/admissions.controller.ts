import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AdmissionsService } from './admissions.service.js';

import { CreateAdmissionDto } from './dto/create-admission.dto.js';
import { UpdateAdmissionDto } from './dto/update-admission.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('admissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class AdmissionsController {
  constructor(
    private readonly admissionsService: AdmissionsService,
  ) {}

  @Post()
  createAdmission(
    @Body() dto: CreateAdmissionDto,
    @Request() req: any,
  ) {
    return this.admissionsService.createAdmission(
      dto,
      req.user,
    );
  }

  @Get()
  getAdmissions(@Request() req: any) {
    return this.admissionsService.getAdmissions(
      req.user,
    );
  }

  @Get(':id')
  getAdmission(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.admissionsService.getAdmission(
      id,
      req.user,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.admissionsService.updateStatus(
      id,
      status,
      req.user,
    );
  }

  @Patch(':id')
  updateAdmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdmissionDto,
    @Request() req: any,
  ) {
    return this.admissionsService.updateAdmission(
      id,
      dto,
      req.user,
    );
  }
}