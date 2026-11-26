import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';
import { ShippingAddress } from '../../orders/schemas/order.schema';

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


  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const updated = await this.userRepository.update(userId, dto);
    if (!updated) {
      throw new NotFoundException('کاربر یافت نشد.');
    }
    return updated;
  }

  async addAddress(userId: string, address: ShippingAddress): Promise<User> {
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
