import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../../prisma/db.js';

import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';

@Injectable()
export class SubjectsService {
  async createSubject(
    dto: CreateSubjectDto,
    currentUser: any,
  ) {
    const schoolId = dto.schoolId;

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create subjects for your own school',
      );
    }

    const school =
      await db.orm.public.School
        .where({ id: schoolId })
        .first();

    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (dto.departmentId) {
      const department =
        await db.orm.public.Department
          .where({
            id: dto.departmentId,
          })
          .first();

      if (!department) {
        throw new NotFoundException(
          'Department not found',
        );
      }

      if (department.schoolId !== schoolId) {
        throw new ForbiddenException(
          'Department does not belong to this school',
        );
      }
    }

    const existing =
      await db.orm.public.Subject
        .where({
          schoolId,
          code: dto.code,
        })
        .first();

    if (existing) {
      throw new ConflictException(
        'Subject code already exists for this school',
      );
    }

    return db.orm.public.Subject.create({
      schoolId,
      departmentId: dto.departmentId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
    });
  }

  async getSubjects(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Subject.all();
    }

    return db.orm.public.Subject
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  async getSubject(
    id: number,
    currentUser: any,
  ) {
    const subject =
      await db.orm.public.Subject
        .where({ id })
        .first();

    if (!subject) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      subject.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access subjects from your own school',
      );
    }

    return subject;
  }

  async updateSubject(
    id: number,
    dto: UpdateSubjectDto,
    currentUser: any,
  ) {
    const subject =
      await db.orm.public.Subject
        .where({ id })
        .first();

    if (!subject) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      subject.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only update subjects from your own school',
      );
    }

    if (dto.departmentId) {
      const department =
        await db.orm.public.Department
          .where({
            id: dto.departmentId,
          })
          .first();

      if (!department) {
        throw new NotFoundException(
          'Department not found',
        );
      }

      if (department.schoolId !== subject.schoolId) {
        throw new ForbiddenException(
          'Department does not belong to this school',
        );
      }
    }

    if (dto.code) {
      const existing =
        await db.orm.public.Subject
          .where({
            schoolId: subject.schoolId,
            code: dto.code,
          })
          .first();

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictException(
          'Subject code already exists for this school',
        );
      }
    }

    await db.orm.public.Subject
      .where({ id })
      .update(dto);

    return this.getSubject(
      id,
      currentUser,
    );
  }

  async deleteSubject(
    id: number,
    currentUser: any,
  ) {
    const subject =
      await db.orm.public.Subject
        .where({ id })
        .first();

    if (!subject) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      subject.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only delete subjects from your own school',
      );
    }

    await db.orm.public.Subject
      .where({ id })
      .delete();

    return {
      message: 'Subject deleted successfully',
    };
  }
}