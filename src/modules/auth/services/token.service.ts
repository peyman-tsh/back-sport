import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenService, JwtPayload, AuthTokens } from '../interfaces/token-service.interface';

/**
 * Single Responsibility Principle (SRP):
 * TokenService encapsulates JWT creation, signing, claims verification, and expiration handling.
 */
@Injectable()
export class TokenService implements ITokenService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    this.refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');
    this.refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const plainPayload = {
      sub: payload.sub,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(plainPayload, {
        secret: this.jwtSecret,
        expiresIn: this.accessExpiresIn,
      }),
      this.jwtService.signAsync(plainPayload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours in seconds
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('توکن دسترسی منقضی شده یا نامعتبر است.');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('توکن تازه‌سازی منقضی شده یا نامعتبر است. لطفاً مجدداً وارد شوید.');
    }
  }
}
