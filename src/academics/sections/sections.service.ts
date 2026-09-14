import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../../prisma/db.js';

import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';

@Injectable()
export class SectionsService {
  async createSection(
    dto: CreateSectionDto,
    currentUser: any,
  ) {
    const classRecord =
      await db.orm.public.Class
        .where({ id: dto.classId })
        .first();

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      classRecord.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create sections for your own school',
      );
    }

    if (dto.code) {
      const existing =
        await db.orm.public.Section
          .where({
            classId: dto.classId,
            code: dto.code,
          })
          .first();

      if (existing) {
        throw new ConflictException(
          'Section code already exists for this class',
        );
      }
    }

    return db.orm.public.Section.create({
      classId: dto.classId,
      name: dto.name,
      code: dto.code,
    });
  }

  async getSections(currentUser: any) {
    const sections =
      await db.orm.public.Section.all();

    if (currentUser.role === 'SUPER_ADMIN') {
      return sections;
    }

    const classes =
      await db.orm.public.Class
        .where({
          schoolId: currentUser.schoolId,
        })
        .all();

    const classIds = classes.map(
      (classRecord) => classRecord.id,
    );

    return sections.filter((section) =>
      classIds.includes(section.classId),
    );
  }

  async getSection(
    id: number,
    currentUser: any,
  ) {
    const section =
      await db.orm.public.Section
        .where({ id })
        .first();

    if (!section) {
      throw new NotFoundException(
        'Section not found',
      );
    }

    const classRecord =
      await db.orm.public.Class
        .where({ id: section.classId })
        .first();

    if (!classRecord) {
      throw new NotFoundException(
        'Class not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      classRecord.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access sections from your own school',
      );
    }

    return section;
  }

  async updateSection(
    id: number,
    dto: UpdateSectionDto,
    currentUser: any,
  ) {
    const section =
      await db.orm.public.Section
        .where({ id })
        .first();

    if (!section) {
      throw new NotFoundException(
        'Section not found',
      );
    }

    const classRecord =
      await db.orm.public.Class
        .where({ id: section.classId })
        .first();

    if (!classRecord) {
      throw new NotFoundException(
        'Class not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      classRecord.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only update sections from your own school',
      );
    }

    if (dto.code) {
      const existing =
        await db.orm.public.Section
          .where({
            classId: section.classId,
            code: dto.code,
          })
          .first();

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictException(
          'Section code already exists for this class',
        );
      }
    }

    await db.orm.public.Section
      .where({ id })
      .update(dto);

    return this.getSection(
      id,
      currentUser,
    );
  }

  async deleteSection(
    id: number,
    currentUser: any,
  ) {
    const section =
      await db.orm.public.Section
        .where({ id })
        .first();

    if (!section) {
      throw new NotFoundException(
        'Section not found',
      );
    }

    const classRecord =
      await db.orm.public.Class
        .where({ id: section.classId })
        .first();

    if (!classRecord) {
      throw new NotFoundException(
        'Class not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      classRecord.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only delete sections from your own school',
      );
    }

    await db.orm.public.Section
      .where({ id })
      .delete();

    return {
      message: 'Section deleted successfully',
    };
  }
}