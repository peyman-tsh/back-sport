import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';

/**
 * Single Responsibility Principle (SRP):
 * UserCommandService handles state mutations, user registration, and address management.
 */
@Injectable()
export class UserCommandService {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async register(dto: RegisterUserDto): Promise<User> {
    const existing = await this.userRepository.findByPhone(dto.phoneNumber);
    if (existing) {
      throw new ConflictException('کاربری با این شماره موبایل قبلاً ثبت‌نام نموده است.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    return this.userRepository.create({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      passwordHash,
      role: 'CUSTOMER',
      isActive: true,
      savedAddresses: [],
      favoriteProductIds: [],
    });
  }

  async validateAndLogin(dto: LoginUserDto) {
    const user = await this.userRepository.findByPhone(dto.phoneNumber, true);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است.');
    }

    const { passwordHash, ...safeUser } = user;
    return {
      user: safeUser,
      token: `AUTH-TOKEN-${Date.now()}-${user.phoneNumber}`, // Lightweight stateless bearer
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const updated = await this.userRepository.update(userId, dto);
    if (!updated) {
      throw new NotFoundException('کاربر یافت نشد.');
    }
    return updated;
  }

  async addAddress(userId: string, address: any): Promise<User> {
    const updated = await this.userRepository.addShippingAddress(userId, address);
    if (!updated) {
      throw new NotFoundException('کاربر یافت نشد.');
    }
    return updated;
  }

  async removeAddress(userId: string, index: number): Promise<User> {
    const updated = await this.userRepository.removeShippingAddress(userId, index);
    if (!updated) {
      throw new NotFoundException('کاربر یافت نشد.');
    }
    return updated;
  }

  async toggleFavorite(userId: string, productId: string) {
    return this.userRepository.toggleFavoriteProduct(userId, productId);
  }
}
