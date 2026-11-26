import { IRepository } from '../../../common/interfaces/repository.interface';
import { User } from '../schemas/user.schema';
import { ShippingAddress } from '../../orders/schemas/order.schema';

export interface IUserRepository extends IRepository<User> {
  findByPhone(phoneNumber: string, includePassword?: boolean): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  addShippingAddress(userId: string, address: ShippingAddress): Promise<User | null>;
  removeShippingAddress(userId: string, index: number): Promise<User | null>;
  toggleFavoriteProduct(userId: string, productId: string): Promise<{ isFavorited: boolean }>;
}
