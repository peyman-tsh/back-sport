import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../common/repositories/base-mongo.repository';
import { User, UserDocument } from '../schemas/user.schema';
import { ShippingAddress } from '../../orders/schemas/order.schema';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepository
  extends BaseMongoRepository<User, UserDocument>
  implements IUserRepository
{
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByPhone(phoneNumber: string, includePassword = false): Promise<User | null> {
    const query = this.userModel.findOne({ phoneNumber });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query.lean<User>().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).lean<User>().exec();
  }

  async addShippingAddress(userId: string, address: ShippingAddress): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { savedAddresses: address } },
        { new: true },
      )
      .lean<User>()
      .exec();
  }

  async removeShippingAddress(userId: string, index: number): Promise<User | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;
    if (index >= 0 && index < user.savedAddresses.length) {
      user.savedAddresses.splice(index, 1);
      await user.save();
    }
    return user.toObject();
  }

  async toggleFavoriteProduct(
    userId: string,
    productId: string,
  ): Promise<{ isFavorited: boolean }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    const exists = user.favoriteProductIds.includes(productId);
    if (exists) {
      user.favoriteProductIds = user.favoriteProductIds.filter((id) => id !== productId);
    } else {
      user.favoriteProductIds.push(productId);
    }

    await user.save();
    return { isFavorited: !exists };
  }
}
