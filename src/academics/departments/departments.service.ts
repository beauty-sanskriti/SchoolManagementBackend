import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../../prisma/db.js';

import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@Injectable()
export class DepartmentsService {

  async createDepartment(
    dto: CreateDepartmentDto,
    currentUser: any,
  ) {
    const schoolId = dto.schoolId;

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create departments for your own school',
      );
    }

    const school =
      await db.orm.public.School
        .where({ id: schoolId })
        .first();

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const existing =
      await db.orm.public.Department
        .where({
          schoolId,
          code: dto.code,
        })
        .first();

    if (existing) {
      throw new ConflictException(
        'Department code already exists for this school',
      );
    }

    return db.orm.public.Department.create({
      schoolId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
    });
  }

  async getDepartments(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Department.all();
    }

    return db.orm.public.Department
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  async getDepartment(
    id: number,
    currentUser: any,
  ) {
    const department =
      await db.orm.public.Department
        .where({ id })
        .first();

    if (!department) {
      throw new NotFoundException(
        'Department not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      department.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access departments from your own school',
      );
    }

    return department;
  }

  async updateDepartment(
    id: number,
    dto: UpdateDepartmentDto,
    currentUser: any,
  ) {
    const department =
      await db.orm.public.Department
        .where({ id })
        .first();

    if (!department) {
      throw new NotFoundException(
        'Department not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      department.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only update departments from your own school',
      );
    }

    if (dto.code) {
      const existing =
        await db.orm.public.Department
          .where({
            schoolId: department.schoolId,
            code: dto.code,
          })
          .first();

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictException(
          'Department code already exists for this school',
        );
      }
    }

    await db.orm.public.Department
      .where({ id })
      .update(dto);

    return this.getDepartment(
      id,
      currentUser,
    );
  }

  async deleteDepartment(
    id: number,
    currentUser: any,
  ) {
    const department =
      await db.orm.public.Department
        .where({ id })
        .first();

    if (!department) {
      throw new NotFoundException(
        'Department not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      department.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only delete departments from your own school',
      );
    }

    await db.orm.public.Department
      .where({ id })
      .delete();

    return {
      message: 'Department deleted successfully',
    };
  }
}