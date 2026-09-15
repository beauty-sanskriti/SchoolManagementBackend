import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ExamsService } from './exams.service.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';
import { CreateExamSubjectDto } from './dto/create-exam-subject.dto.js';
import { UpdateExamSubjectDto } from './dto/update-exam-subject.dto.js';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { UpdateQuestionDto } from './dto/update-question.dto.js';
import { SubmitExamDto } from './dto/submit-exam.dto.js';
import { CreateResultDto } from './dto/create-result.dto.js';
import { UpdateResultDto } from './dto/update-result.dto.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('exams')
  createExam(@Body() dto: CreateExamDto, @Req() req: any) {
    return this.examsService.createExam(dto, req.user);
  }

  @Get('exams')
  findAllExams(@Req() req: any) {
    return this.examsService.findAllExams(req.user);
  }

  @Get('exams/:id')
  findOneExam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.examsService.findOneExam(id, req.user);
  }

  @Patch('exams/:id')
  updateExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
    @Req() req: any,
  ) {
    return this.examsService.updateExam(id, dto, req.user);
  }

  @Delete('exams/:id')
  deleteExam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.examsService.deleteExam(id, req.user);
  }

  @Post('exams/:id/subjects')
  addSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateExamSubjectDto,
    @Req() req: any,
  ) {
    return this.examsService.addSubject(id, dto, req.user);
  }

  @Get('exams/:id/subjects')
  getSubjects(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.examsService.getSubjects(id, req.user);
  }

  @Patch('exams/:id/subjects/:subjectId')
  updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Body() dto: UpdateExamSubjectDto,
    @Req() req: any,
  ) {
    return this.examsService.updateSubject(
      id,
      subjectId,
      dto,
      req.user,
    );
  }

  @Delete('exams/:id/subjects/:subjectId')
  deleteSubject(
    @Param('id', ParseIntPipe) id: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Req() req: any,
  ) {
    return this.examsService.deleteSubject(
      id,
      subjectId,
      req.user,
    );
  }

  @Post('exams/:id/questions')
  addQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQuestionDto,
    @Req() req: any,
  ) {
    return this.examsService.addQuestion(id, dto, req.user);
  }

  @Get('exams/:id/questions')
  getQuestions(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.examsService.getQuestions(id, req.user);
  }

  @Patch('exams/:id/questions/:questionId')
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: UpdateQuestionDto,
    @Req() req: any,
  ) {
    return this.examsService.updateQuestion(
      id,
      questionId,
      dto,
      req.user,
    );
  }

  @Delete('exams/:id/questions/:questionId')
  deleteQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Req() req: any,
  ) {
    return this.examsService.deleteQuestion(
      id,
      questionId,
      req.user,
    );
  }

  @Post('exams/:id/start')
  startExam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.examsService.startExam(id, req.user);
  }

  @Post('exams/:id/submit')
  submitExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitExamDto,
    @Req() req: any,
  ) {
    return this.examsService.submitExam(id, dto, req.user);
  }

  @Get('exams/:id/result')
  getExamResult(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.examsService.getExamResult(id, req.user);
  }

  @Post('results')
  createResult(@Body() dto: CreateResultDto, @Req() req: any) {
    return this.examsService.createResult(dto, req.user);
  }

  @Get('results')
  findAllResults(@Req() req: any) {
    return this.examsService.findAllResults(req.user);
  }

  @Get('results/:id')
  findOneResult(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.examsService.findOneResult(id, req.user);
  }

  @Patch('results/:id')
  updateResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResultDto,
    @Req() req: any,
  ) {
    return this.examsService.updateResult(id, dto, req.user);
  }

  @Get('students/:id/results')
  studentResults(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.examsService.studentResults(id, req.user);
  }

  @Get('students/:id/report-card')
  reportCard(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.examsService.reportCard(id, req.user);
  }
}