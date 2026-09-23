import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { db } from '../prisma/db.js';

import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';

@Injectable()
export class StudentsService {
  async createStudent(
    dto: CreateStudentDto,
    currentUser: any,
  ) {
    if (
      currentUser.role !== 'SCHOOL_ADMIN' ||
      !currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'Only School Admin can create students',
      );
    }

    const schoolId = currentUser.schoolId;

    const school = await db.orm.public.School
      .where({ id: schoolId })
      .first();

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    if (dto.classId) {
      const classRecord =
        await db.orm.public.Class
          .where({ id: dto.classId })
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
    }

    if (dto.sectionId) {
      const section =
        await db.orm.public.Section
          .where({ id: dto.sectionId })
          .first();

      if (!section) {
        throw new NotFoundException(
          'Section not found',
        );
      }

      if (
        dto.classId &&
        section.classId !== dto.classId
      ) {
        throw new ForbiddenException(
          'Section does not belong to this class',
        );
      }
    }

    const existingStudent =
      await db.orm.public.Student
        .where({
          admissionNo: dto.admissionNo,
        })
        .first();

    if (existingStudent) {
      throw new ConflictException(
        'Admission number already exists',
      );
    }

    const existingUser =
      await db.orm.public.User
        .where({
          email: dto.email,
        })
        .first();

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const user =
      await db.orm.public.User.create({
        schoolId,
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: 'STUDENT',
        emailVerified: true,
        phoneVerified: false,
      });

    try {
      const student =
        await db.orm.public.Student.create({
          schoolId,
          userId: user.id,
          classId: dto.classId,
          sectionId: dto.sectionId,
          admissionNo: dto.admissionNo,
          rollNumber: dto.rollNumber,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          country: dto.country,
        });

      const {
        password: _,
        ...userWithoutPassword
      } = user;

      return {
        message:
          'Student created successfully',
        user: userWithoutPassword,
        student,
      };
    } catch (error) {
      await db.orm.public.User
        .where({
          id: user.id,
        })
        .delete();

      throw error;
    }
  }

  async getStudents(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Student.all();
    }

    return db.orm.public.Student
      .where({
        schoolId: currentUser.schoolId,
      })
      .all();
  }

  async getStudent(
    id: number,
    currentUser: any,
  ) {
    const student =
      await db.orm.public.Student
        .where({ id })
        .first();

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    this.checkAccess(
      student,
      currentUser,
    );

    return student;
  }

  async updateStudent(
    id: number,
    dto: UpdateStudentDto,
    currentUser: any,
  ) {
    const student =
      await db.orm.public.Student
        .where({ id })
        .first();

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    this.checkAccess(
      student,
      currentUser,
    );

    if (dto.classId) {
      const classRecord =
        await db.orm.public.Class
          .where({ id: dto.classId })
          .first();

      if (!classRecord) {
        throw new NotFoundException(
          'Class not found',
        );
      }

      if (
        classRecord.schoolId !==
        student.schoolId
      ) {
        throw new ForbiddenException(
          'Class does not belong to this school',
        );
      }
    }

    if (dto.sectionId) {
      const section =
        await db.orm.public.Section
          .where({ id: dto.sectionId })
          .first();

      if (!section) {
        throw new NotFoundException(
          'Section not found',
        );
      }

      const classId =
        dto.classId ??
        student.classId;

      if (
        classId &&
        section.classId !== classId
      ) {
        throw new ForbiddenException(
          'Section does not belong to this class',
        );
      }
    }

    if (dto.admissionNo) {
      const existing =
        await db.orm.public.Student
          .where({
            admissionNo:
              dto.admissionNo,
          })
          .first();

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictException(
          'Admission number already exists',
        );
      }
    }

    await db.orm.public.Student
      .where({ id })
      .update(dto);

    return this.getStudent(
      id,
      currentUser,
    );
  }

  async deleteStudent(
    id: number,
    currentUser: any,
  ) {
    const student =
      await db.orm.public.Student
        .where({ id })
        .first();

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    this.checkAccess(
      student,
      currentUser,
    );

    await db.orm.public.Student
      .where({ id })
      .delete();

    return {
      message:
        'Student deleted successfully',
    };
  }

  async getProfile(
    id: number,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    const profile =
      await db.orm.public.StudentProfile
        .where({
          studentId: student.id,
        })
        .first();

    return {
      student,
      profile,
    };
  }

  async updateProfile(
    id: number,
    dto: UpdateStudentProfileDto,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    const existing =
      await db.orm.public.StudentProfile
        .where({
          studentId: student.id,
        })
        .first();

    if (existing) {
      await db.orm.public.StudentProfile
        .where({
          studentId: student.id,
        })
        .update(dto);
    } else {
      await db.orm.public.StudentProfile.create({
        studentId: student.id,
        fatherName:
          dto.fatherName,
        motherName:
          dto.motherName,
        guardianName:
          dto.guardianName,
        guardianPhone:
          dto.guardianPhone,
        emergencyPhone:
          dto.emergencyPhone,
      });
    }

    return this.getProfile(
      id,
      currentUser,
    );
  }

  async getClasses(
    id: number,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    if (!student.classId) {
      return [];
    }

    return db.orm.public.Class
      .where({
        id: student.classId,
      })
      .all();
  }

  async getAttendance(
    id: number,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    return db.orm.public.Attendance
      .where({
        studentId: student.id,
      })
      .all();
  }

  async getResults(
    id: number,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    return db.orm.public.Result
      .where({
        studentId: student.id,
      })
      .all();
  }

  async getFees(
    id: number,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    return db.orm.public.StudentFee
      .where({
        studentId: student.id,
      })
      .all();
  }

  async addDocument(
    id: number,
    dto: any,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    return db.orm.public.StudentDocument.create({
      studentId: student.id,
      name: dto.name,
      fileUrl: dto.fileUrl,
      fileType: dto.fileType,
    });
  }

  async getDocuments(
    id: number,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    return db.orm.public.StudentDocument
      .where({
        studentId: student.id,
      })
      .all();
  }

  async deleteDocument(
    id: number,
    documentId: number,
    currentUser: any,
  ) {
    const student =
      await this.getStudent(
        id,
        currentUser,
      );

    const document =
      await db.orm.public.StudentDocument
        .where({
          id: documentId,
          studentId: student.id,
        })
        .first();

    if (!document) {
      throw new NotFoundException(
        'Student document not found',
      );
    }

    await db.orm.public.StudentDocument
      .where({
        id: documentId,
      })
      .delete();

    return {
      message:
        'Student document deleted successfully',
    };
  }

  private checkAccess(
    student: any,
    currentUser: any,
  ) {
    if (
      currentUser.role ===
        'SCHOOL_ADMIN' &&
      student.schoolId !==
        currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access students from your own school',
      );
    }
  }

  // POST /students/admit
  async admitStudent(dto: any, currentUser: any) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      dto.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only admit students to your own school',
      );
    }

    return db.orm.public.Student.create({
      ...dto,
    });
  }

  // POST /students/bulk-import
  async bulkImport(students: any[], currentUser: any) {
    if (!Array.isArray(students) || students.length === 0) {
      throw new NotFoundException(
        'Provide a non-empty "students" array to import',
      );
    }

    const created = [];

    for (const record of students) {
      if (
        currentUser.role === 'SCHOOL_ADMIN' &&
        record.schoolId !== currentUser.schoolId
      ) {
        continue;
      }

      created.push(
        await db.orm.public.Student.create({ ...record }),
      );
    }

    return {
      importedCount: created.length,
      students: created,
    };
  }

  // POST /students/:id/generate-account
  async generateAccount(id: number, currentUser: any) {
    const student = await this.getStudent(id, currentUser);

    if (student.userId) {
      throw new ForbiddenException(
        'This student already has a linked account',
      );
    }

    throw new NotFoundException(
      'Student has no email on file; add one via PATCH /students/:id first',
    );
  }

  // GET /students/:id/id-card
  async getIdCard(id: number, currentUser: any) {
    const student = await this.getStudent(id, currentUser);
    const profile = await db.orm.public.StudentProfile
      .where({ studentId: student.id })
      .first();

    return {
      admissionNo: student.admissionNo,
      rollNumber: student.rollNumber,
      classId: student.classId,
      sectionId: student.sectionId,
      bloodGroup: student.bloodGroup,
      guardianPhone: profile?.guardianPhone ?? null,
    };
  }

  // GET /students/:id/lifecycle
  async getLifecycle(id: number, currentUser: any) {
    const student = await this.getStudent(id, currentUser);

    const admissions = await db.orm.public.Admission
      .where({ studentId: student.id })
      .all();

    const disciplinaryRecords =
      await db.orm.public.StudentDisciplinaryRecord
        .where({ studentId: student.id })
        .all();

    return {
      admissions,
      disciplinaryRecords,
      currentStatus: student.status ?? 'ACTIVE',
    };
  }
}