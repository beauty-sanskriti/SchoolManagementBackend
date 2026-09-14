import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../../prisma/db.js';

import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

@Injectable()
export class ClassesService {
  async createClass(
    dto: CreateClassDto,
    currentUser: any,
  ) {
    const schoolId = dto.schoolId;

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create classes for your own school',
      );
    }

    const school =
      await db.orm.public.School
        .where({ id: schoolId })
        .first();

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const academicYear =
      await db.orm.public.AcademicYear
        .where({
          id: dto.academicYearId,
        })
        .first();

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    if (academicYear.schoolId !== schoolId) {
      throw new ForbiddenException(
        'Academic year does not belong to this school',
      );
    }

    if (dto.code) {
      const existing =
        await db.orm.public.Class
          .where({
            schoolId,
            academicYearId: dto.academicYearId,
            code: dto.code,
          })
          .first();

      if (existing) {
        throw new ConflictException(
          'Class code already exists for this academic year',
        );
      }
    }

    return db.orm.public.Class.create({
      schoolId,
      academicYearId: dto.academicYearId,
      name: dto.name,
      code: dto.code,
    });
  }

  async getClasses(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Class.all();
    }

    return db.orm.public.Class
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  async getClass(
    id: number,
    currentUser: any,
  ) {
    const classRecord =
      await db.orm.public.Class
        .where({ id })
        .first();

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      classRecord.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access classes from your own school',
      );
    }

    return classRecord;
  }

  async updateClass(
    id: number,
    dto: UpdateClassDto,
    currentUser: any,
  ) {
    const classRecord =
      await db.orm.public.Class
        .where({ id })
        .first();

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      classRecord.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only update classes from your own school',
      );
    }

    if (dto.code) {
      const existing =
        await db.orm.public.Class
          .where({
            schoolId: classRecord.schoolId,
            academicYearId: classRecord.academicYearId,
            code: dto.code,
          })
          .first();

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictException(
          'Class code already exists for this academic year',
        );
      }
    }

    await db.orm.public.Class
      .where({ id })
      .update(dto);

    return this.getClass(
      id,
      currentUser,
    );
  }

  async deleteClass(
    id: number,
    currentUser: any,
  ) {
    const classRecord =
      await db.orm.public.Class
        .where({ id })
        .first();

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      classRecord.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only delete classes from your own school',
      );
    }

    await db.orm.public.Class
      .where({ id })
      .delete();

    return {
      message: 'Class deleted successfully',
    };
  }
}