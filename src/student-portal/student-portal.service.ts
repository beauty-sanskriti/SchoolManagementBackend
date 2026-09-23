import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class StudentPortalService {
  private async getStudent(user: any) {
    if (user.role !== 'STUDENT') {
      throw new ForbiddenException(
        'Only students can access the student portal',
      );
    }

    if (!user.studentId) {
      throw new ForbiddenException(
        'Student profile is not linked to this account',
      );
    }

    const student = await db.orm.public.Student
      .where({
        id: user.studentId,
        schoolId: user.schoolId,
      })
      .first();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async getDashboard(user: any) {
    const student = await this.getStudent(user);

    const [
      attendance,
      exams,
      assignments,
      timetable,
      results,
      notifications,
      fees,
    ] = await Promise.all([
      db.orm.public.Attendance
        .where({ studentId: student.id })
        .all(),

      db.orm.public.Exam
        .where({ schoolId: student.schoolId })
        .all(),

      db.orm.public.Assignment
        .where({ schoolId: student.schoolId })
        .all(),

      db.orm.public.Timetable
        .where({
          schoolId: student.schoolId,
          classId: student.classId,
        })
        .all(),

      db.orm.public.Result
        .where({ studentId: student.id })
        .all(),

      db.orm.public.Notification
        .where({
          userId: student.userId ?? 0,
          schoolId: student.schoolId,
        })
        .all(),

      db.orm.public.StudentFee
        .where({ studentId: student.id })
        .all(),
    ]);

    const present = attendance.filter(
      (item) => item.status === 'PRESENT',
    ).length;

    const attendancePercentage =
      attendance.length > 0
        ? Number(
            ((present / attendance.length) * 100).toFixed(2),
          )
        : 0;

    return {
      student,
      attendancePercentage,
      upcomingExams: exams.filter(
        (exam) =>
          exam.status === 'SCHEDULED' ||
          exam.status === 'LIVE',
      ),
      assignments,
      todaysClasses: timetable,
      results,
      notifications,
      fees,
    };
  }

  async getProfile(user: any) {
    const student = await this.getStudent(user);

    const profile = await db.orm.public.StudentProfile
      .where({ studentId: student.id })
      .first();

    return {
      student,
      profile,
    };
  }

  async updateProfile(body: any, user: any) {
    const student = await this.getStudent(user);

    const profile = await db.orm.public.StudentProfile
      .where({ studentId: student.id })
      .first();

    if (!profile) {
      return db.orm.public.StudentProfile.create({
        studentId: student.id,
        fatherName: body.fatherName,
        motherName: body.motherName,
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        emergencyPhone: body.emergencyPhone,
      });
    }

    return db.orm.public.StudentProfile
      .where({ id: profile.id })
      .update({
        fatherName: body.fatherName,
        motherName: body.motherName,
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        emergencyPhone: body.emergencyPhone,
      });
  }

  async getClasses(user: any) {
    const student = await this.getStudent(user);

    if (!student.classId) {
      return [];
    }

    return db.orm.public.Timetable
      .where({
        schoolId: student.schoolId,
        classId: student.classId,
        ...(student.sectionId
          ? { sectionId: student.sectionId }
          : {}),
      })
      .all();
  }

  async getTimetable(user: any) {
    return this.getClasses(user);
  }

  async getAssignments(user: any) {
    const student = await this.getStudent(user);

    const assignments = await db.orm.public.Assignment
      .where({
        schoolId: student.schoolId,
        ...(student.classId
          ? { classId: student.classId }
          : {}),
      })
      .all();

    const submissions = await db.orm.public.AssignmentSubmission
      .where({ studentId: student.id })
      .all();

    return assignments.map((assignment) => ({
      ...assignment,
      submission:
        submissions.find(
          (submission) =>
            submission.assignmentId === assignment.id,
        ) ?? null,
    }));
  }

  async getAssignment(id: number, user: any) {
    const student = await this.getStudent(user);

    const assignment = await db.orm.public.Assignment
      .where({
        id,
        schoolId: student.schoolId,
      })
      .first();

    if (!assignment) {
      throw new NotFoundException(
        'Assignment not found',
      );
    }

    const submission =
      await db.orm.public.AssignmentSubmission
        .where({
          assignmentId: id,
          studentId: student.id,
        })
        .first();

    return {
      assignment,
      submission,
    };
  }

  async submitAssignment(
    id: number,
    body: any,
    user: any,
  ) {
    const student = await this.getStudent(user);

    const assignment =
      await db.orm.public.Assignment
        .where({
          id,
          schoolId: student.schoolId,
        })
        .first();

    if (!assignment) {
      throw new NotFoundException(
        'Assignment not found',
      );
    }

    const existing =
      await db.orm.public.AssignmentSubmission
        .where({
          assignmentId: id,
          studentId: student.id,
        })
        .first();

    if (existing) {
      return db.orm.public.AssignmentSubmission
        .where({ id: existing.id })
        .update({
          content: body.content,
          fileUrl: body.fileUrl,
          submittedAt: new Date().toISOString(),
        });
    }

    return db.orm.public.AssignmentSubmission.create({
      assignmentId: id,
      studentId: student.id,
      content: body.content,
      fileUrl: body.fileUrl,
      submittedAt: new Date().toISOString(),
    });
  }

  async getAttendance(user: any) {
    const student = await this.getStudent(user);

    return db.orm.public.Attendance
      .where({ studentId: student.id })
      .all();
  }

  async getResults(user: any) {
    const student = await this.getStudent(user);

    return db.orm.public.Result
      .where({ studentId: student.id })
      .all();
  }

  async getReportCard(user: any) {
    const student = await this.getStudent(user);

    const results = await db.orm.public.Result
      .where({ studentId: student.id })
      .all();

    return {
      student,
      results,
    };
  }

  async getFees(user: any) {
    const student = await this.getStudent(user);

    return db.orm.public.StudentFee
      .where({ studentId: student.id })
      .all();
  }

  async getPayments(user: any) {
    const student = await this.getStudent(user);

    const fees = await db.orm.public.StudentFee
      .where({ studentId: student.id })
      .all();

    const payments = [];

    for (const fee of fees) {
      const feePayments = await db.orm.public.Payment
        .where({ studentFeeId: fee.id })
        .all();

      payments.push(...feePayments);
    }

    return payments;
  }

  async getExams(user: any) {
    const student = await this.getStudent(user);

    return db.orm.public.Exam
      .where({ schoolId: student.schoolId })
      .all();
  }

  async getExam(id: number, user: any) {
    const student = await this.getStudent(user);

    const exam = await db.orm.public.Exam
      .where({
        id,
        schoolId: student.schoolId,
      })
      .first();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  async startExam(id: number, user: any) {
    const student = await this.getStudent(user);

    const exam = await db.orm.public.Exam
      .where({
        id,
        schoolId: student.schoolId,
      })
      .first();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const existing = await db.orm.public.ExamAttempt
      .where({
        examId: id,
        studentId: student.id,
      })
      .first();

    if (existing && !existing.submittedAt) {
      return existing;
    }

    return db.orm.public.ExamAttempt.create({
      examId: id,
      studentId: student.id,
      startedAt: new Date().toISOString(),
    });
  }

  async submitExam(
    id: number,
    body: any,
    user: any,
  ) {
    const student = await this.getStudent(user);

    const attempt = await db.orm.public.ExamAttempt
      .where({
        id: body.attemptId,
        examId: id,
        studentId: student.id,
      })
      .first();

    if (!attempt) {
      throw new NotFoundException(
        'Exam attempt not found',
      );
    }

    return db.orm.public.ExamAttempt
      .where({ id: attempt.id })
      .update({
        submittedAt: new Date().toISOString(),
      });
  }

  async getNotifications(user: any) {
    const student = await this.getStudent(user);

    return db.orm.public.Notification
      .where({
        userId: student.userId ?? 0,
        schoolId: student.schoolId,
      })
      .all();
  }

  async markNotificationRead(
    id: number,
    user: any,
  ) {
    const student = await this.getStudent(user);

    const notification =
      await db.orm.public.Notification
        .where({
          id,
          userId: student.userId ?? 0,
          schoolId: student.schoolId,
        })
        .first();

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    return db.orm.public.Notification
      .where({ id })
      .update({
        isRead: true,
      });
  }

  async markAllNotificationsRead(user: any) {
    const student = await this.getStudent(user);

    const notifications =
      await db.orm.public.Notification
        .where({
          userId: student.userId ?? 0,
          schoolId: student.schoolId,
        })
        .all();

    for (const notification of notifications) {
      if (!notification.isRead) {
        await db.orm.public.Notification
          .where({ id: notification.id })
          .update({
            isRead: true,
          });
      }
    }

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }
}