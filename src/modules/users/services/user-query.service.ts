import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { User } from '../schemas/user.schema';

/**
 * Single Responsibility Principle (SRP):
 * UserQueryService is strictly responsible for querying user data and profiles.
 *
 * Dependency Inversion Principle (DIP):
 * Injected with abstract IUserRepository via INJECTION_TOKENS.
 */
@Injectable()
export class UserQueryService {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`کاربر با شناسه ${id} یافت نشد.`);
    }
    return user;
  }

  async getUserByPhone(phone: string, includePassword = false): Promise<User | null> {
    return this.userRepository.findByPhone(phone, includePassword);
  }

  async getAllUsers(page = 1, limit = 20) {
    return this.userRepository.findAll({}, { page, limit });
  }
}
