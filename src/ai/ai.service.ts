import { Injectable, NotFoundException } from '@nestjs/common';

import { db } from '../prisma/db.js';

type AiRequestType =
  | 'CHAT'
  | 'DOUBT_SOLVER'
  | 'PERFORMANCE'
  | 'ATTENDANCE_ANOMALY'
  | 'TIMETABLE'
  | 'REPORT_SUMMARY'
  | 'RECOMMENDATION';

@Injectable()
export class AiService {
  private async callModel(prompt: string): Promise<string> {
    return `AI response pending — connect an LLM provider to answer: "${prompt}"`;
  }

  private async logRequest(
    type: AiRequestType,
    prompt: string,
    response: string,
    currentUser: any,
  ) {
    return db.orm.public.AIRequest.create({
      schoolId: currentUser.schoolId,
      userId: currentUser.userId,
      type,
      prompt,
      response,
      status: 'COMPLETED',
    });
  }

  // POST /ai/chat
  async chat(message: string, currentUser: any) {
    const response = await this.callModel(message);
    return this.logRequest('CHAT', message, response, currentUser);
  }

  // POST /ai/doubt-solver
  async doubtSolver(question: string, currentUser: any) {
    const response = await this.callModel(question);
    return this.logRequest('DOUBT_SOLVER', question, response, currentUser);
  }

  // GET /ai/student-performance/:id
  async studentPerformance(studentId: number, currentUser: any) {
    const results = await db.orm.public.Result.where({ studentId }).all();

    const avgMarks =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.marks, 0) / results.length
        : 0;

    const prompt = `Analyze performance for student ${studentId}`;
    const response = await this.callModel(prompt);

    return this.logRequest(
      'PERFORMANCE',
      prompt,
      `${response} (average marks so far: ${avgMarks})`,
      currentUser,
    );
  }

  // GET /ai/attendance-anomalies
  async attendanceAnomalies(currentUser: any) {
    const prompt = 'Detect attendance anomalies for this school';
    const response = await this.callModel(prompt);
    return this.logRequest('ATTENDANCE_ANOMALY', prompt, response, currentUser);
  }

  // POST /ai/timetable/generate
  async generateTimetable(dto: any, currentUser: any) {
    const prompt = `Generate a timetable with constraints: ${JSON.stringify(dto)}`;
    const response = await this.callModel(prompt);
    return this.logRequest('TIMETABLE', prompt, response, currentUser);
  }

  // GET /ai/recommendations/:studentId
  async recommendations(studentId: number, currentUser: any) {
    const prompt = `Suggest learning recommendations for student ${studentId}`;
    const response = await this.callModel(prompt);
    return this.logRequest('RECOMMENDATION', prompt, response, currentUser);
  }

  // POST /ai/report-summary
  async reportSummary(dto: any, currentUser: any) {
    const prompt = `Summarize report data: ${JSON.stringify(dto)}`;
    const response = await this.callModel(prompt);
    return this.logRequest('REPORT_SUMMARY', prompt, response, currentUser);
  }
}
