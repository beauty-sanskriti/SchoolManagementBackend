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

import { LibraryService } from './library.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('books')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  createBook(@Body() dto: any, @Request() req: any) {
    return this.libraryService.createBook(dto, req.user);
  }

  @Get('books')
  getBooks(@Request() req: any) {
    return this.libraryService.getBooks(req.user);
  }

  @Get('books/:id')
  getBook(@Param('id', ParseIntPipe) id: number) {
    return this.libraryService.getBook(id);
  }

  @Patch('books/:id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.libraryService.updateBook(id, dto);
  }

  @Delete('books/:id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  deleteBook(@Param('id', ParseIntPipe) id: number) {
    return this.libraryService.deleteBook(id);
  }

  @Post('issues')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  issueBook(@Body() dto: any) {
    return this.libraryService.issueBook(dto);
  }

  @Get('issues')
  getIssues() {
    return this.libraryService.getIssues();
  }

  @Patch('issues/:id/return')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  returnBook(
    @Param('id', ParseIntPipe) id: number,
    @Body('fine') fine?: number,
  ) {
    return this.libraryService.returnBook(id, fine);
  }

  @Get('fines')
  getFines() {
    return this.libraryService.getFines();
  }

  @Patch('fines/:id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateFine(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.libraryService.updateFine(id, dto);
  }
}
