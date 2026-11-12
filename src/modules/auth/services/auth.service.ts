import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IUserRepository } from '../../users/interfaces/user-repository.interface';
import { IHashService } from '../interfaces/hash-service.interface';
import { ITokenService } from '../interfaces/token-service.interface';
import { IAuthService, AuthResponse } from '../interfaces/auth-service.interface';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthTokens } from '../interfaces/token-service.interface';

/**
 * Single Responsibility Principle (SRP):
 * AuthService orchestrates registration, authentication logic, and token delivery.
 * Cryptographic operations are delegated to HashService, and JWT signing is delegated to TokenService.
 */
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(INJECTION_TOKENS.HASH_SERVICE)
    private readonly hashService: IHashService,
    @Inject(INJECTION_TOKENS.TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findByPhone(dto.phoneNumber);
    if (existing) {
      throw new ConflictException('کاربری با این شماره موبایل قبلاً در سیستم ثبت‌نام نموده است.');
    }

    const passwordHash = await this.hashService.hashPassword(dto.password);

    const newUser = await this.userRepository.create({
      fullName: dto.fullName.trim(),
      phoneNumber: dto.phoneNumber.trim(),
      email: dto.email ? dto.email.trim().toLowerCase() : undefined,
      passwordHash,
      role: 'CUSTOMER',
      isActive: true,
      savedAddresses: [],
      favoriteProductIds: [],
    });

    const userId = (newUser as any)._id?.toString() || newUser.id;

    const tokens = await this.tokenService.generateTokens({
      sub: userId,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
    });

    return {
      user: {
        id: userId,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        role: newUser.role,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByPhone(dto.phoneNumber, true);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است. لطفاً با پشتیبانی تماس بگیرید.');
    }

    const isMatch = await this.hashService.comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است.');
    }

    const userId = (user as any)._id?.toString() || user.id;

    const tokens = await this.tokenService.generateTokens({
      sub: userId,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    return {
      user: {
        id: userId,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('کاربر نامعتبر یا غیرفعال است.');
    }

    const userId = (user as any)._id?.toString() || user.id;

    return this.tokenService.generateTokens({
      sub: userId,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('حساب کاربری مورد نظر یافت نشد.');
    }

    return {
      id: (user as any)._id?.toString() || user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      savedAddresses: user.savedAddresses || [],
      favoriteProductIds: user.favoriteProductIds || [],
      createdAt: (user as any).createdAt,
    };
  }
}
