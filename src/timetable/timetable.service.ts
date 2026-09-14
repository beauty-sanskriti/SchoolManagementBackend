import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

import { CreateTimetableDto } from './dto/create-timetable.dto.js';
import { UpdateTimetableDto } from './dto/update-timetable.dto.js';

@Injectable()
export class TimetableService {
  async createTimetable(
    dto: CreateTimetableDto,
    currentUser: any,
  ) {
    this.checkSchoolAccess(dto.schoolId, currentUser);

    await this.validateReferences(
      dto.schoolId,
      dto.classId,
      dto.sectionId,
      dto.teacherId,
      dto.subjectId,
    );

    this.validateTime(dto.startTime, dto.endTime);

    await this.checkScheduleConflict(
      dto.schoolId,
      dto.classId,
      dto.sectionId,
      dto.teacherId,
      dto.day,
      dto.startTime,
      dto.endTime,
    );

    return db.orm.public.Timetable.create({
      schoolId: dto.schoolId,
      classId: dto.classId,
      sectionId: dto.sectionId,
      teacherId: dto.teacherId,
      subjectId: dto.subjectId,
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
      room: dto.room,
    });
  }

  async getTimetables(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Timetable.all();
    }

    return db.orm.public.Timetable
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  async getTimetable(
    id: number,
    currentUser: any,
  ) {
    const timetable =
      await db.orm.public.Timetable
        .where({ id })
        .first();

    if (!timetable) {
      throw new NotFoundException(
        'Timetable not found',
      );
    }

    this.checkSchoolAccess(
      timetable.schoolId,
      currentUser,
    );

    return timetable;
  }

  async updateTimetable(
    id: number,
    dto: UpdateTimetableDto,
    currentUser: any,
  ) {
    const timetable =
      await db.orm.public.Timetable
        .where({ id })
        .first();

    if (!timetable) {
      throw new NotFoundException(
        'Timetable not found',
      );
    }

    this.checkSchoolAccess(
      timetable.schoolId,
      currentUser,
    );

    const classId =
      dto.classId ?? timetable.classId;

    const sectionId =
      dto.sectionId ?? timetable.sectionId;

    const teacherId =
      dto.teacherId ?? timetable.teacherId;

    const subjectId =
      dto.subjectId ?? timetable.subjectId;

    const day =
      dto.day ?? timetable.day;

    const startTime =
      dto.startTime ?? timetable.startTime;

    const endTime =
      dto.endTime ?? timetable.endTime;

    await this.validateReferences(
      timetable.schoolId,
      classId,
      sectionId,
      teacherId,
      subjectId,
    );

    this.validateTime(
      startTime,
      endTime,
    );

    await this.checkScheduleConflict(
      timetable.schoolId,
      classId,
      sectionId,
      teacherId,
      day,
      startTime,
      endTime,
      id,
    );

    await db.orm.public.Timetable
      .where({ id })
      .update(dto);

    return this.getTimetable(
      id,
      currentUser,
    );
  }

  async deleteTimetable(
    id: number,
    currentUser: any,
  ) {
    const timetable =
      await db.orm.public.Timetable
        .where({ id })
        .first();

    if (!timetable) {
      throw new NotFoundException(
        'Timetable not found',
      );
    }

    this.checkSchoolAccess(
      timetable.schoolId,
      currentUser,
    );

    await db.orm.public.Timetable
      .where({ id })
      .delete();

    return {
      message: 'Timetable deleted successfully',
    };
  }

  async getStudentTimetable(
    studentId: number,
    currentUser: any,
  ) {
    const student =
      await db.orm.public.Student
        .where({ id: studentId })
        .first();

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    this.checkSchoolAccess(
      student.schoolId,
      currentUser,
    );

    if (!student.classId) {
      return [];
    }

    if (student.sectionId) {
      return db.orm.public.Timetable
        .where({
          classId: student.classId,
          sectionId: student.sectionId,
        })
        .all();
    }

    return db.orm.public.Timetable
      .where({
        classId: student.classId,
      })
      .all();
  }

  private async validateReferences(
    schoolId: number,
    classId: number,
    sectionId: number | null | undefined,
    teacherId: number | null | undefined,
    subjectId: number,
  ) {
    const school =
      await db.orm.public.School
        .where({ id: schoolId })
        .first();

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    const classRecord =
      await db.orm.public.Class
        .where({ id: classId })
        .first();

    if (!classRecord) {
      throw new NotFoundException(
        'Class not found',
      );
    }

    if (classRecord.schoolId !== schoolId) {
      throw new ForbiddenException(
        'Class does not belong to this school',
      );
    }

    if (sectionId) {
      const section =
        await db.orm.public.Section
          .where({ id: sectionId })
          .first();

      if (!section) {
        throw new NotFoundException(
          'Section not found',
        );
      }

      if (section.classId !== classId) {
        throw new ForbiddenException(
          'Section does not belong to this class',
        );
      }
    }

    if (teacherId) {
      const teacher =
        await db.orm.public.Teacher
          .where({ id: teacherId })
          .first();

      if (!teacher) {
        throw new NotFoundException(
          'Teacher not found',
        );
      }

      if (teacher.schoolId !== schoolId) {
        throw new ForbiddenException(
          'Teacher does not belong to this school',
        );
      }
    }

    const subject =
      await db.orm.public.Subject
        .where({ id: subjectId })
        .first();

    if (!subject) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    if (subject.schoolId !== schoolId) {
      throw new ForbiddenException(
        'Subject does not belong to this school',
      );
    }
  }

  private async checkScheduleConflict(
    schoolId: number,
    classId: number,
    sectionId: number | null | undefined,
    teacherId: number | null | undefined,
    day: string,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ) {
    const schedules =
      await db.orm.public.Timetable
        .where({
          schoolId,
          day,
        })
        .all();

    const conflict = schedules.find(
      (schedule: any) => {
        if (
          excludeId &&
          schedule.id === excludeId
        ) {
          return false;
        }

        const sameClass =
          schedule.classId === classId &&
          (!sectionId ||
            !schedule.sectionId ||
            schedule.sectionId === sectionId);

        const sameTeacher =
          teacherId &&
          schedule.teacherId === teacherId;

        const overlap =
          startTime < schedule.endTime &&
          endTime > schedule.startTime;

        return (
          overlap &&
          (sameClass || sameTeacher)
        );
      },
    );

    if (conflict) {
      throw new ConflictException(
        'Timetable schedule conflict',
      );
    }
  }

  private validateTime(
    startTime: string,
    endTime: string,
  ) {
    if (startTime >= endTime) {
      throw new ConflictException(
        'End time must be after start time',
      );
    }
  }

  private checkSchoolAccess(
    schoolId: number,
    currentUser: any,
  ) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access timetable from your own school',
      );
    }
  }
}