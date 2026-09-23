import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class LmsService {
  private checkAccess(course: any, currentUser: any) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      course.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access courses from your own school',
      );
    }
  }

  // POST /courses
  createCourse(dto: any, currentUser: any) {
    return db.orm.public.Course.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      classId: dto.classId,
      subjectId: dto.subjectId,
      teacherId: dto.teacherId,
      title: dto.title,
      description: dto.description,
      thumbnail: dto.thumbnail,
      status: dto.status ?? 'DRAFT',
    });
  }

  // GET /courses
  getCourses(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Course.all();
    }
    return db.orm.public.Course.where({ schoolId: currentUser.schoolId }).all();
  }

  // GET /courses/:id
  async getCourse(id: number, currentUser: any) {
    const course = await db.orm.public.Course.where({ id }).first();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.checkAccess(course, currentUser);
    return course;
  }

  // PATCH /courses/:id
  async updateCourse(id: number, dto: any, currentUser: any) {
    await this.getCourse(id, currentUser);
    await db.orm.public.Course.where({ id }).update({ ...dto });
    return this.getCourse(id, currentUser);
  }

  // DELETE /courses/:id
  async deleteCourse(id: number, currentUser: any) {
    await this.getCourse(id, currentUser);
    await db.orm.public.Course.where({ id }).delete();
    return { message: 'Course deleted successfully' };
  }

  // POST /courses/:id/lessons
  async createLesson(id: number, dto: any, currentUser: any) {
    await this.getCourse(id, currentUser);

    return db.orm.public.Lesson.create({
      courseId: id,
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      duration: dto.duration,
      position: dto.position ?? 0,
      isPublished: dto.isPublished ?? false,
    });
  }

  // GET /courses/:id/lessons
  async getLessons(id: number, currentUser: any) {
    await this.getCourse(id, currentUser);
    return db.orm.public.Lesson.where({ courseId: id }).all();
  }

  // PATCH /lessons/:id
  async updateLesson(id: number, dto: any) {
    await db.orm.public.Lesson.where({ id }).update({ ...dto });
    return db.orm.public.Lesson.where({ id }).first();
  }

  // DELETE /lessons/:id
  async deleteLesson(id: number) {
    await db.orm.public.Lesson.where({ id }).delete();
    return { message: 'Lesson deleted successfully' };
  }

  // POST /courses/:id/resources
  async addResource(id: number, dto: any, currentUser: any) {
    const lesson = await db.orm.public.Lesson
      .where({ id: dto.lessonId, courseId: id })
      .first();

    if (!lesson) {
      throw new NotFoundException('Lesson not found in this course');
    }

    return db.orm.public.CourseResource.create({
      lessonId: lesson.id,
      name: dto.name,
      fileUrl: dto.fileUrl,
      fileType: dto.fileType,
    });
  }

  // POST /courses/:id/quizzes
  async createQuiz(id: number, dto: any, currentUser: any) {
    await this.getCourse(id, currentUser);

    return db.orm.public.Quiz.create({
      courseId: id,
      title: dto.title,
      description: dto.description,
      status: dto.status ?? 'DRAFT',
      duration: dto.duration,
      totalMarks: dto.totalMarks,
    });
  }

  // GET /courses/:id/quizzes
  async getQuizzes(id: number, currentUser: any) {
    await this.getCourse(id, currentUser);
    return db.orm.public.Quiz.where({ courseId: id }).all();
  }

  // POST /courses/:id/enroll
  async enroll(id: number, studentId: number, currentUser: any) {
    await this.getCourse(id, currentUser);

    const existing = await db.orm.public.CourseEnrollment
      .where({ courseId: id, studentId })
      .first();

    if (existing) {
      return existing;
    }

    return db.orm.public.CourseEnrollment.create({
      courseId: id,
      studentId,
      status: 'ACTIVE',
      enrolledAt: new Date().toISOString(),
    });
  }

  // GET /courses/:id/students
  async getCourseStudents(id: number, currentUser: any) {
    await this.getCourse(id, currentUser);
    return db.orm.public.CourseEnrollment.where({ courseId: id }).all();
  }
}
