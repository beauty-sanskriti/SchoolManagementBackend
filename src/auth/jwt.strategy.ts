import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'school-management-secret',
    });
  }

  async validate(payload: {
    sub: number;
    schoolId: number;
    role: string;
  }) {
    return {
      userId: payload.sub,
      schoolId: payload.schoolId,
      role: payload.role,
    };
  }
}