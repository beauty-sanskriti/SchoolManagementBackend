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

import { CampusesService } from './campuses.service.js';

import { CreateCampusDto } from './dto/create-campus.dto.js';
import { UpdateCampusDto } from './dto/update-campus.dto.js';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('campuses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
export class CampusesController {

  constructor(
    private readonly campusesService: CampusesService,
  ) {}

  // POST /campuses
  @Post()
  createCampus(
    @Body()
    createCampusDto: CreateCampusDto,
    @Request() req: any,
  ) {
    return this.campusesService.createCampus(
      createCampusDto,
      req.user,
    );
  }

  // GET /campuses
  @Get()
  getCampuses(
    @Request() req: any,
  ) {
    return this.campusesService.getCampuses(
      req.user,
    );
  }

  // GET /campuses/:id
  @Get(':id')
  getCampus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.campusesService.getCampus(
      id,
      req.user,
    );
  }

  // PATCH /campuses/:id
  @Patch(':id')
  updateCampus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateCampusDto: UpdateCampusDto,
    @Request() req: any,
  ) {
    return this.campusesService.updateCampus(
      id,
      updateCampusDto,
      req.user,
    );
  }

  // DELETE /campuses/:id
  @Delete(':id')
  deleteCampus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.campusesService.deleteCampus(
      id,
      req.user,
    );
  }
}