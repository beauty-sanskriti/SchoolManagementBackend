import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { UpdateSchoolStatusDto } from './dto/update-school-status.dto.js';

@Injectable()
export class SchoolsService {

  // POST /schools
  async createSchool(
    schoolData: CreateSchoolDto,
  ) {
    try {
      return await db.orm.public.School.create(
        schoolData,
      );
    } catch (error: any) {
      if (
        error?.constraint ===
        'school_email_key'
      ) {
        throw new ConflictException(
          'School email is already registered',
        );
      }

      if (
        error?.constraint ===
        'school_phone_key'
      ) {
        throw new ConflictException(
          'School phone number is already registered',
        );
      }

      throw error;
    }
  }

  // GET /schools
  async getSchools() {
    return db.orm.public.School.all();
  }

  // GET /schools/:id
  async getSchool(id: number) {
    const school =
      await db.orm.public.School
        .where({
          id,
        })
        .first();

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    return school;
  }

  // PATCH /schools/:id
  async updateSchool(
    id: number,
    updateSchoolDto: UpdateSchoolDto,
  ) {
    const existingSchool =
      await db.orm.public.School
        .where({
          id,
        })
        .first();

    if (!existingSchool) {
      throw new NotFoundException(
        'School not found',
      );
    }

    try {
      await db.orm.public.School
        .where({
          id,
        })
        .update(updateSchoolDto);

      return this.getSchool(id);
    } catch (error: any) {
      if (
        error?.constraint ===
        'school_email_key'
      ) {
        throw new ConflictException(
          'School email is already registered',
        );
      }

      if (
        error?.constraint ===
        'school_phone_key'
      ) {
        throw new ConflictException(
          'School phone number is already registered',
        );
      }

      throw error;
    }
  }

  // DELETE /schools/:id
  async deleteSchool(id: number) {
    const existingSchool =
      await db.orm.public.School
        .where({
          id,
        })
        .first();

    if (!existingSchool) {
      throw new NotFoundException(
        'School not found',
      );
    }

    await db.orm.public.School
      .where({
        id,
      })
      .delete();

    return {
      message:
        'School deleted successfully',
    };
  }

  // GET /schools/:id/users
  async getSchoolUsers(id: number) {
    await this.getSchool(id);

    const users =
      await db.orm.public.User
        .where({
          schoolId: id,
        })
        .all();

    return users.map(
      ({ password, ...user }) => user,
    );
  }

  // GET /schools/:id/students
  async getSchoolStudents(id: number) {
    await this.getSchool(id);

    const users =
      await db.orm.public.User
        .where({
          schoolId: id,
          role: 'STUDENT',
        })
        .all();

    return users.map(
      ({ password, ...user }) => user,
    );
  }

  // GET /schools/:id/teachers
  async getSchoolTeachers(id: number) {
    await this.getSchool(id);

    const users =
      await db.orm.public.User
        .where({
          schoolId: id,
          role: 'TEACHER',
        })
        .all();

    return users.map(
      ({ password, ...user }) => user,
    );
  }

  // PATCH /schools/:id/status
  async updateSchoolStatus(
    id: number,
    updateSchoolStatusDto: UpdateSchoolStatusDto,
  ) {
    const existingSchool =
      await db.orm.public.School
        .where({
          id,
        })
        .first();

    if (!existingSchool) {
      throw new NotFoundException(
        'School not found',
      );
    }

    await db.orm.public.School
      .where({
        id,
      })
      .update({
        status:
          updateSchoolStatusDto.status as
            | 'ACTIVE'
            | 'INACTIVE',
      });

    return this.getSchool(id);
  }
}