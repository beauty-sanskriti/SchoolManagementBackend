import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class TeacherPortalService {
  private async getTeacher(currentUser: any) {
    const teacher = await db.orm.public.Teacher
      .where({ userId: currentUser.userId })
      .first();

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacher;
  }

  private async assertOwnAssignment(assignment: any, currentUser: any) {
    const teacher = await this.getTeacher(currentUser);

    if (assignment.teacherId !== teacher.id) {
      throw new ForbiddenException('This is not your assignment');
    }
  }

  // GET /teachers/:id/dashboard
  async dashboard(id: number, currentUser: any) {
    const teacher = await db.orm.public.Teacher.where({ id }).first();

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const assignments = await db.orm.public.Assignment
      .where({ teacherId: id })
      .all();

    const classes = await db.orm.public.Timetable
      .where({ teacherId: id })
      .all();

    return {
      assignmentsCount: assignments.length,
      upcomingClassesCount: classes.length,
    };
  }

  // GET /teachers/:id/assignments
  getTeacherAssignments(id: number) {
    return db.orm.public.Assignment.where({ teacherId: id }).all();
  }

  // POST /assignments
  async createAssignment(dto: any, currentUser: any) {
    const teacher = await this.getTeacher(currentUser);

    return db.orm.public.Assignment.create({
      schoolId: teacher.schoolId,
      teacherId: teacher.id,
      creatorId: currentUser.userId,
      classId: dto.classId,
      subjectId: dto.subjectId,
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      status: dto.status ?? 'DRAFT',
    });
  }

  // GET /assignments
  async getAssignments(currentUser: any) {
    if (currentUser.role === 'TEACHER') {
      const teacher = await this.getTeacher(currentUser);
      return db.orm.public.Assignment.where({ teacherId: teacher.id }).all();
    }

    return db.orm.public.Assignment.where({
      schoolId: currentUser.schoolId,
    }).all();
  }

  // GET /assignments/:id
  async getAssignment(id: number) {
    const assignment = await db.orm.public.Assignment.where({ id }).first();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  // PATCH /assignments/:id
  async updateAssignment(id: number, dto: any, currentUser: any) {
    const assignment = await this.getAssignment(id);

    if (currentUser.role === 'TEACHER') {
      await this.assertOwnAssignment(assignment, currentUser);
    }

    await db.orm.public.Assignment.where({ id }).update({ ...dto });
    return this.getAssignment(id);
  }

  // DELETE /assignments/:id
  async deleteAssignment(id: number, currentUser: any) {
    const assignment = await this.getAssignment(id);

    if (currentUser.role === 'TEACHER') {
      await this.assertOwnAssignment(assignment, currentUser);
    }

    await db.orm.public.Assignment.where({ id }).delete();
    return { message: 'Assignment deleted successfully' };
  }

  // POST /assignments/:id/submit
  async submitAssignment(id: number, dto: any, currentUser: any) {
    const assignment = await this.getAssignment(id);

    const student = await db.orm.public.Student
      .where({ userId: currentUser.userId })
      .first();

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return db.orm.public.AssignmentSubmission.create({
      assignmentId: assignment.id,
      studentId: student.id,
      content: dto.content,
      fileUrl: dto.fileUrl,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    });
  }

  // GET /assignments/:id/submissions
  getSubmissions(id: number) {
    return db.orm.public.AssignmentSubmission
      .where({ assignmentId: id })
      .all();
  }

  // PATCH /submissions/:id
  async gradeSubmission(id: number, dto: any) {
    await db.orm.public.AssignmentSubmission.where({ id }).update({
      marks: dto.marks,
      feedback: dto.feedback,
      status: 'GRADED',
    });

    return db.orm.public.AssignmentSubmission.where({ id }).first();
  }

  // GET /teacher/examinations
  async getExaminations(currentUser: any) {
    const teacher = await this.getTeacher(currentUser);

    const subjects = await db.orm.public.TeacherSubject
      .where({ teacherId: teacher.id })
      .all();

    const subjectIds = new Set(subjects.map((s) => s.subjectId));

    const examSubjects = await db.orm.public.ExamSubject.all();
    const relevant = examSubjects.filter((es) => subjectIds.has(es.subjectId));

    const examIds = [...new Set(relevant.map((es) => es.examId))];
    const exams = await db.orm.public.Exam.all();

    return exams.filter((e) => examIds.includes(e.id));
  }

  // POST /teacher/examinations/:id/evaluate
  async evaluateExam(examId: number, dto: any) {
    return db.orm.public.Result.create({
      examId,
      studentId: dto.studentId,
      subjectId: dto.subjectId,
      marks: dto.marks,
      grade: dto.grade,
      remarks: dto.remarks,
    });
  }

  // GET /teacher/communication
  async getCommunication(currentUser: any) {
    const participants = await db.orm.public.ConversationParticipant
      .where({ userId: currentUser.userId })
      .all();

    const conversationIds = participants.map((p) => p.conversationId);
    const conversations = await db.orm.public.Conversation.all();

    return conversations.filter((c) => conversationIds.includes(c.id));
  }

  // GET /teacher/salary
  async getSalary(currentUser: any) {
    const teacher = await this.getTeacher(currentUser);

    const employee = await db.orm.public.Employee
      .where({
        schoolId: teacher.schoolId,
        employeeNo: teacher.employeeNo,
      })
      .first();

    if (!employee) {
      return { message: 'No payroll record found yet', payslips: [] };
    }

    const payslips = await db.orm.public.Payroll
      .where({ employeeId: employee.id })
      .all();

    return { employee, payslips };
  }

  // GET /teacher/profile
  getProfile(currentUser: any) {
    return this.getTeacher(currentUser);
  }
}
