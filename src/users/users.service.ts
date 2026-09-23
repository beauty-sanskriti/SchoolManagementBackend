import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { db } from '../prisma/db.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';

@Injectable()
export class UsersService {

  // GET /users
  async getUsers(user: any) {
    let users;

    if (user.role === 'SUPER_ADMIN') {
      users = await db.orm.public.User.all();
    } else {
      users = await db.orm.public.User
        .where({
          schoolId: user.schoolId,
        })
        .all();
    }

    return users.map(
      ({ password, ...user }) => user,
    );
  }

  // GET /users/me
  async getMe(userId: number) {
    const user =
      await db.orm.public.User
        .where({
          id: userId,
        })
        .first();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const {
      password: _,
      ...userWithoutPassword
    } = user;

    return userWithoutPassword;
  }

  // PATCH /users/me
  async updateMe(
    userId: number,
    updateUserDto: UpdateUserDto,
  ) {
    const existingUser =
      await db.orm.public.User
        .where({
          id: userId,
        })
        .first();

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    try {
      await db.orm.public.User
        .where({
          id: userId,
        })
        .update(updateUserDto);

      const updatedUser =
        await db.orm.public.User
          .where({
            id: userId,
          })
          .first();

      if (!updatedUser) {
        throw new NotFoundException(
          'User not found',
        );
      }

      const {
        password: _,
        ...userWithoutPassword
      } = updatedUser;

      return userWithoutPassword;
    } catch (error: any) {
      this.handleUserConflict(error);
    }
  }

  // GET /users/:id
  async getUser(
    id: number,
    currentUser: any,
  ) {
    const user =
      await db.orm.public.User
        .where({
          id,
        })
        .first();

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      user.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only access users from your own school',
      );
    }

    const {
      password: _,
      ...userWithoutPassword
    } = user;

    return userWithoutPassword;
  }

  // PATCH /users/:id
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: any,
  ) {
    const existingUser =
      await db.orm.public.User
        .where({
          id,
        })
        .first();

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      existingUser.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only update users from your own school',
      );
    }

    try {
      await db.orm.public.User
        .where({
          id,
        })
        .update(updateUserDto);

      const updatedUser =
        await db.orm.public.User
          .where({
            id,
          })
          .first();

      if (!updatedUser) {
        throw new NotFoundException(
          'User not found',
        );
      }

      const {
        password: _,
        ...userWithoutPassword
      } = updatedUser;

      return userWithoutPassword;
    } catch (error: any) {
      this.handleUserConflict(error);
    }
  }

  // DELETE /users/:id
  async deleteUser(
    id: number,
    currentUser: any,
  ) {
    const existingUser =
      await db.orm.public.User
        .where({
          id,
        })
        .first();

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      existingUser.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only delete users from your own school',
      );
    }

    if (existingUser.id === currentUser.userId) {
      throw new ForbiddenException(
        'You cannot delete your own account',
      );
    }

    await db.orm.public.Verification
      .where({
        userId: id,
      })
      .delete();

    await db.orm.public.User
      .where({
        id,
      })
      .delete();

    return {
      message: 'User deleted successfully',
    };
  }

  // GET /users/role/:role
  async getUsersByRole(
    role: string,
    currentUser: any,
  ) {
    const allowedRoles = [
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'TEACHER',
      'STUDENT',
      'PARENT',
    ];

    if (!allowedRoles.includes(role)) {
      throw new NotFoundException(
        'Invalid user role',
      );
    }

    const userRole =
      role as
        | 'SUPER_ADMIN'
        | 'SCHOOL_ADMIN'
        | 'TEACHER'
        | 'STUDENT'
        | 'PARENT';

    let users;

    if (currentUser.role === 'SUPER_ADMIN') {
      users =
        await db.orm.public.User
          .where({
            role: userRole,
          })
          .all();
    } else {
      users =
        await db.orm.public.User
          .where({
            schoolId: currentUser.schoolId,
            role: userRole,
          })
          .all();
    }

    return users.map(
      ({ password, ...user }) => user,
    );
  }

  // PATCH /users/:id/role
  async updateUserRole(
    id: number,
    updateUserRoleDto: UpdateUserRoleDto,
    currentUser: any,
  ) {
    const existingUser =
      await db.orm.public.User
        .where({
          id,
        })
        .first();

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      existingUser.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only change roles of users from your own school',
      );
    }

    await db.orm.public.User
      .where({
        id,
      })
      .update({
        role: updateUserRoleDto.role as
          | 'SUPER_ADMIN'
          | 'SCHOOL_ADMIN'
          | 'TEACHER'
          | 'STUDENT'
          | 'PARENT',
      });

    const updatedUser =
      await db.orm.public.User
        .where({
          id,
        })
        .first();

    if (!updatedUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const {
      password: _,
      ...userWithoutPassword
    } = updatedUser;

    return userWithoutPassword;
  }

  // POST /users
  async createUser(
    createUserDto: CreateUserDto,
    currentUser: any,
  ) {
    if (
      currentUser.role === 'SCHOOL_ADMIN' &&
      createUserDto.schoolId !== currentUser.schoolId
    ) {
      throw new ForbiddenException(
        'You can only create users for your own school',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    try {
      const user =
        await db.orm.public.User.create({
          ...createUserDto,
          password: hashedPassword,
          role: createUserDto.role as
            | 'SUPER_ADMIN'
            | 'SCHOOL_ADMIN'
            | 'TEACHER'
            | 'STUDENT'
            | 'PARENT',
        });

      const {
        password,
        ...userWithoutPassword
      } = user;

      return userWithoutPassword;
    } catch (error: any) {
      this.handleUserConflict(error);
    }
  }

  private handleUserConflict(
    error: any,
  ): never {
    if (
      error?.constraint === 'user_email_key'
    ) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    if (
      error?.constraint === 'user_phone_key'
    ) {
      throw new ConflictException(
        'Phone number is already registered',
      );
    }

    if (
      error?.constraint === 'user_username_key'
    ) {
      throw new ConflictException(
        'Username is already registered',
      );
    }

    throw error;
  }
}