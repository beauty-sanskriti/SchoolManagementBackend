import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { db } from '../prisma/db.js';

import { CreateSchoolDto } from './dto/create-school.dto.js';
import { CreateSchoolAdminDto } from './dto/create-school-admin.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { UpdateSchoolStatusDto } from './dto/update-school-status.dto.js';

@Injectable()
export class SchoolsService {
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

  async createSchoolAdmin(
    schoolId: number,
    adminData: CreateSchoolAdminDto,
  ) {
    const school =
      await db.orm.public.School
        .where({
          id: schoolId,
        })
        .first();

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    const existingUser =
      await db.orm.public.User
        .where({
          email: adminData.email,
        })
        .first();

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        adminData.password,
        10,
      );

    const user =
      await db.orm.public.User.create({
        schoolId,
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: 'SCHOOL_ADMIN',
        emailVerified: true,
        phoneVerified: false,
      });

    const {
      password: _,
      ...userWithoutPassword
    } = user;

    return {
      message:
        'School Admin created successfully',
      user: userWithoutPassword,
    };
  }

  async getSchools() {
    return db.orm.public.School.all();
  }

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

  // GET /schools/:id/settings
  async getSchoolSettings(id: number) {
    const school = await this.getSchool(id);

    const settings = await db.orm.public.SchoolSetting
      .where({ schoolId: id })
      .first();

    return settings ?? { schoolId: school.id };
  }

  // PATCH /schools/:id/settings
  async updateSchoolSettings(id: number, dto: Record<string, any>) {
    await this.getSchool(id);

    const existing = await db.orm.public.SchoolSetting
      .where({ schoolId: id })
      .first();

    if (existing) {
      await db.orm.public.SchoolSetting
        .where({ id: existing.id })
        .update({ ...dto });
    } else {
      await db.orm.public.SchoolSetting.create({
        schoolId: id,
        ...dto,
      });
    }

    return this.getSchoolSettings(id);
  }
}