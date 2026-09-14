import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';

@Injectable()
export class TeachersService {
  async createTeacher(
    dto: CreateTeacherDto,
    currentUser: any,
  ) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      dto.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create teachers for your own school',
      );
    }

    const school = await db.orm.public.School
      .where({ id: dto.schoolId })
      .first();

    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (dto.userId) {
      const user = await db.orm.public.User
        .where({ id: dto.userId })
        .first();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.schoolId !== dto.schoolId) {
        throw new ForbiddenException(
          'User does not belong to this school',
        );
      }
    }

    if (dto.departmentId) {
      const department =
        await db.orm.public.Department
          .where({ id: dto.departmentId })
          .first();

      if (!department) {
        throw new NotFoundException(
          'Department not found',
        );
      }

      if (department.schoolId !== dto.schoolId) {
        throw new ForbiddenException(
          'Department does not belong to this school',
        );
      }
    }

    const existing =
      await db.orm.public.Teacher
        .where({
          employeeNo: dto.employeeNo,
        })
        .first();

    if (existing) {
      throw new ConflictException(
        'Employee number already exists',
      );
    }

    return db.orm.public.Teacher.create({
      schoolId: dto.schoolId,
      userId: dto.userId,
      departmentId: dto.departmentId,
      employeeNo: dto.employeeNo,
      joiningDate: dto.joiningDate,
      qualification: dto.qualification,
      designation: dto.designation,
    });
  }

  async getTeachers(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Teacher.all();
    }

    return db.orm.public.Teacher
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  async getTeacher(
    id: number,
    currentUser: any,
  ) {
    const teacher =
      await db.orm.public.Teacher
        .where({ id })
        .first();

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    this.checkAccess(teacher, currentUser);

    return teacher;
  }

  async updateTeacher(
    id: number,
    dto: UpdateTeacherDto,
    currentUser: any,
  ) {
    const teacher =
      await db.orm.public.Teacher
        .where({ id })
        .first();

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    this.checkAccess(teacher, currentUser);

    if (dto.userId) {
      const user = await db.orm.public.User
        .where({ id: dto.userId })
        .first();

      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }

      if (user.schoolId !== teacher.schoolId) {
        throw new ForbiddenException(
          'User does not belong to this school',
        );
      }
    }

    if (dto.departmentId) {
      const department =
        await db.orm.public.Department
          .where({ id: dto.departmentId })
          .first();

      if (!department) {
        throw new NotFoundException(
          'Department not found',
        );
      }

      if (department.schoolId !== teacher.schoolId) {
        throw new ForbiddenException(
          'Department does not belong to this school',
        );
      }
    }

    if (dto.employeeNo) {
      const existing =
        await db.orm.public.Teacher
          .where({
            employeeNo: dto.employeeNo,
          })
          .first();

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Employee number already exists',
        );
      }
    }

    await db.orm.public.Teacher
      .where({ id })
      .update(dto);

    return this.getTeacher(
      id,
      currentUser,
    );
  }

  async deleteTeacher(
    id: number,
    currentUser: any,
  ) {
    const teacher =
      await db.orm.public.Teacher
        .where({ id })
        .first();

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    this.checkAccess(teacher, currentUser);

    await db.orm.public.Teacher
      .where({ id })
      .delete();

    return {
      message: 'Teacher deleted successfully',
    };
  }

  async getProfile(
    id: number,
    currentUser: any,
  ) {
    const teacher = await this.getTeacher(
      id,
      currentUser,
    );

    return teacher;
  }

  async getClasses(
    id: number,
    currentUser: any,
  ) {
    const teacher = await this.getTeacher(
      id,
      currentUser,
    );

    return db.orm.public.Timetable
      .where({
        teacherId: teacher.id,
      })
      .all();
  }

  async getSubjects(
    id: number,
    currentUser: any,
  ) {
    const teacher = await this.getTeacher(
      id,
      currentUser,
    );

    return db.orm.public.TeacherSubject
      .where({
        teacherId: teacher.id,
      })
      .all();
  }

  async getTimetable(
    id: number,
    currentUser: any,
  ) {
    const teacher = await this.getTeacher(
      id,
      currentUser,
    );

    return db.orm.public.Timetable
      .where({
        teacherId: teacher.id,
      })
      .all();
  }

  async getAttendance(
    id: number,
    currentUser: any,
  ) {
    const teacher = await this.getTeacher(
      id,
      currentUser,
    );

    return db.orm.public.TeacherAttendance
      .where({
        teacherId: teacher.id,
      })
      .all();
  }

  private checkAccess(
    teacher: any,
    currentUser: any,
  ) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      teacher.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access teachers from your own school',
      );
    }
  }
}