import { Injectable } from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class SuperAdminService {
  // GET /super-admin/dashboard
  async dashboard() {
    const schools = await db.orm.public.School.all();
    const users = await db.orm.public.User.all();
    const subscriptions = await db.orm.public.Subscription.all();

    return {
      totalSchools: schools.length,
      activeSchools: schools.filter((s) => s.status === 'ACTIVE').length,
      totalUsers: users.length,
      activeSubscriptions: subscriptions.filter((s) => s.status === 'ACTIVE')
        .length,
    };
  }

  // GET /super-admin/schools
  getSchools() {
    return db.orm.public.School.all();
  }

  // POST /super-admin/schools
  createSchool(dto: any) {
    return db.orm.public.School.create({ ...dto });
  }

  // GET /super-admin/schools/:id
  getSchool(id: number) {
    return db.orm.public.School.where({ id }).first();
  }

  // PATCH /super-admin/schools/:id
  async updateSchool(id: number, dto: any) {
    await db.orm.public.School.where({ id }).update({ ...dto });
    return this.getSchool(id);
  }

  // DELETE /super-admin/schools/:id
  async deleteSchool(id: number) {
    await db.orm.public.School.where({ id }).delete();
    return { message: 'School deleted successfully' };
  }

  // PATCH /super-admin/schools/:id/status
  async updateSchoolStatus(id: number, status: 'ACTIVE' | 'INACTIVE') {
    await db.orm.public.School.where({ id }).update({ status });
    return this.getSchool(id);
  }

  // GET /super-admin/schools/:id/users
  getSchoolUsers(id: number) {
    return db.orm.public.User.where({ schoolId: id }).all();
  }

  // GET /super-admin/schools/:id/students
  getSchoolStudents(id: number) {
    return db.orm.public.Student.where({ schoolId: id }).all();
  }

  // GET /super-admin/schools/:id/teachers
  getSchoolTeachers(id: number) {
    return db.orm.public.Teacher.where({ schoolId: id }).all();
  }

  // GET /super-admin/subscriptions
  getSubscriptions() {
    return db.orm.public.Subscription.all();
  }

  // GET /super-admin/payments
  getPayments() {
    return db.orm.public.Payment.all();
  }

  // GET /super-admin/users
  getUsers() {
    return db.orm.public.User.all();
  }

  // GET /super-admin/reports
  getReports() {
    return db.orm.public.ReportJob.all();
  }

  // GET /super-admin/support
  getSupportTickets() {
    return db.orm.public.SupportTicket.all();
  }

  // GET /super-admin/settings
  getSettings() {
    return db.orm.public.SchoolSetting.all();
  }

  // GET /super-admin/activity-logs
  getActivityLogs() {
    return db.orm.public.AuditLog.all();
  }

  // GET /super-admin/analytics
  async getAnalytics() {
    const schools = await db.orm.public.School.all();
    const students = await db.orm.public.Student.all();
    const teachers = await db.orm.public.Teacher.all();
    const payments = await db.orm.public.Payment.all();

    const totalRevenue = payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalSchools: schools.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalRevenue,
    };
  }
}
