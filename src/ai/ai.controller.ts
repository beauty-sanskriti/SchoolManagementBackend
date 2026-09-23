import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AiService } from './ai.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@Body('message') message: string, @Request() req: any) {
    return this.aiService.chat(message, req.user);
  }

  @Post('doubt-solver')
  doubtSolver(@Body('question') question: string, @Request() req: any) {
    return this.aiService.doubtSolver(question, req.user);
  }

  @Get('student-performance/:id')
  studentPerformance(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.aiService.studentPerformance(id, req.user);
  }

  @Get('attendance-anomalies')
  attendanceAnomalies(@Request() req: any) {
    return this.aiService.attendanceAnomalies(req.user);
  }

  @Post('timetable/generate')
  generateTimetable(@Body() dto: any, @Request() req: any) {
    return this.aiService.generateTimetable(dto, req.user);
  }

  @Get('recommendations/:studentId')
  recommendations(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Request() req: any,
  ) {
    return this.aiService.recommendations(studentId, req.user);
  }

  @Post('report-summary')
  reportSummary(@Body() dto: any, @Request() req: any) {
    return this.aiService.reportSummary(dto, req.user);
  }
}
