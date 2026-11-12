import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/token-service.interface';
import { UserQueryService } from '../../users/services/user-query.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userQueryService: UserQueryService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'lumix_sport_ultra_secure_jwt_secret_key_2026!',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.userQueryService.getUserById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('حساب کاربری یافت نشد یا غیرفعال شده است.');
      }
      return {
        id: user.id || (user as any)._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('توکن نامعتبر است یا کاربر یافت نشد.');
    }
  }
}
