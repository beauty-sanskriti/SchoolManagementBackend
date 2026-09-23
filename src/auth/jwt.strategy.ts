import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'school-management-secret',
    });
  }

  async validate(payload: {
    sub: number;
    schoolId?: number;
    role: string;
    studentId?: number;
  }) {
    return {
      userId: payload.sub,
      ...(payload.schoolId !== undefined && {
        schoolId: payload.schoolId,
      }),
      role: payload.role,
      ...(payload.studentId !== undefined && {
        studentId: payload.studentId,
      }),
    };
  }
}