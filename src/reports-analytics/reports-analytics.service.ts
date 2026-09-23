import { Injectable } from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class ReportsAnalyticsService {
  private scopeId(currentUser: any) {
    return currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.schoolId;
  }

  // GET /reports/students
  async studentsReport(currentUser: any) {
    const schoolId = this.scopeId(currentUser);
    const students = schoolId
      ? await db.orm.public.Student.where({ schoolId }).all()
      : await db.orm.public.Student.all();

    return { count: students.length, students };
  }

  // GET /reports/attendance
  async attendanceReport(currentUser: any) {
    return db.orm.public.Attendance.all();
  }

  // GET /reports/exams
  async examsReport(currentUser: any) {
    const schoolId = this.scopeId(currentUser);
    return schoolId
      ? db.orm.public.Exam.where({ schoolId }).all()
      : db.orm.public.Exam.all();
  }

  // GET /reports/fees
  async feesReport(currentUser: any) {
    return db.orm.public.StudentFee.all();
  }

  // GET /reports/teachers
  async teachersReport(currentUser: any) {
    const schoolId = this.scopeId(currentUser);
    return schoolId
      ? db.orm.public.Teacher.where({ schoolId }).all()
      : db.orm.public.Teacher.all();
  }

  // GET /reports/schools
  async schoolsReport() {
    return db.orm.public.School.all();
  }

  // GET /analytics/dashboard
  async analyticsDashboard(currentUser: any) {
    const schoolId = this.scopeId(currentUser);

    const students = schoolId
      ? await db.orm.public.Student.where({ schoolId }).all()
      : await db.orm.public.Student.all();

    const teachers = schoolId
      ? await db.orm.public.Teacher.where({ schoolId }).all()
      : await db.orm.public.Teacher.all();

    return {
      studentCount: students.length,
      teacherCount: teachers.length,
    };
  }

  // GET /analytics/students
  async studentsAnalytics(currentUser: any) {
    const schoolId = this.scopeId(currentUser);
    const students = schoolId
      ? await db.orm.public.Student.where({ schoolId }).all()
      : await db.orm.public.Student.all();

    const byStatus: Record<string, number> = {};

    for (const student of students) {
      const status = student.status ?? 'ACTIVE';
      byStatus[status] = (byStatus[status] ?? 0) + 1;
    }

    return { total: students.length, byStatus };
  }

  // GET /analytics/attendance
  async attendanceAnalytics(currentUser: any) {
    const all = await db.orm.public.Attendance.all();
    const byStatus: Record<string, number> = {};

    for (const record of all) {
      byStatus[record.status] = (byStatus[record.status] ?? 0) + 1;
    }

    return { total: all.length, byStatus };
  }

  // GET /analytics/finance
  async financeAnalytics() {
    const payments = await db.orm.public.Payment.all();

    const totalCollected = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalPayments: payments.length, totalCollected };
  }

  // GET /analytics/exams
  async examsAnalytics(currentUser: any) {
    const results = await db.orm.public.Result.all();

    const avgMarks =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.marks, 0) / results.length
        : 0;

    return { totalResults: results.length, averageMarks: avgMarks };
  }

  // POST /reports/custom
  async customReport(dto: any, currentUser: any) {
    return db.orm.public.ReportJob.create({
      schoolId: currentUser.schoolId ?? dto.schoolId,
      createdById: currentUser.userId,
      name: dto.name ?? 'Custom report',
      type: 'CUSTOM',
      filters: JSON.stringify(dto.filters ?? {}),
      status: 'QUEUED',
    });
  }

  // POST /reports/export/pdf
  async exportPdf(dto: any, currentUser: any) {
    return db.orm.public.ReportJob.create({
      schoolId: currentUser.schoolId ?? dto.schoolId,
      createdById: currentUser.userId,
      name: dto.name ?? 'PDF export',
      type: 'PDF_EXPORT',
      filters: JSON.stringify(dto.filters ?? {}),
      status: 'QUEUED',
    });
  }

  // POST /reports/export/excel
  async exportExcel(dto: any, currentUser: any) {
    return db.orm.public.ReportJob.create({
      schoolId: currentUser.schoolId ?? dto.schoolId,
      createdById: currentUser.userId,
      name: dto.name ?? 'Excel export',
      type: 'EXCEL_EXPORT',
      filters: JSON.stringify(dto.filters ?? {}),
      status: 'QUEUED',
    });
  }
}
