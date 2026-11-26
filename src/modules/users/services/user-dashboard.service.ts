import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IOrderRepository } from '../../orders/interfaces/order-repository.interface';
import {
  IUserDashboardService,
  CustomerDashboardDto,
  CustomerStatsDto,
} from '../interfaces/user-dashboard.interface';
import { OrderStatus } from '../../orders/schemas/order.schema';

/**
 * Single Responsibility Principle (SRP):
 * UserDashboardService is solely responsible for aggregating customer dashboard metrics,
 * calculating financial expenditures, tracking active orders, and composing the customer view model.
 *
 * Dependency Inversion Principle (DIP):
 * Relies strictly on abstract interfaces (IUserRepository, IOrderRepository) injected via tokens.
 */
@Injectable()
export class UserDashboardService implements IUserDashboardService {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async getCustomerDashboard(userId: string): Promise<CustomerDashboardDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`کاربری با شناسه ${userId} یافت نشد.`);
    }

    const orders = await this.orderRepository.findByUserId(userId);

    const stats = this.calculateCustomerStats(user, orders);
    const recentOrders = orders.slice(0, 5);

    return {
      user: {
        id: user.id || (user as any)._id?.toString(),
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        createdAt: (user as any).createdAt,
      },
      stats,
      recentOrders,
      savedAddresses: user.savedAddresses || [],
      favoriteProductIds: user.favoriteProductIds || [],
    };
  }

  private calculateCustomerStats(user: any, orders: any[]): CustomerStatsDto {
    const paidStatuses: OrderStatus[] = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const activeStatuses: OrderStatus[] = ['PAID', 'PROCESSING', 'SHIPPED'];

    const paidOrders = orders.filter((o) => paidStatuses.includes(o.status));
    const totalSpent = paidOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const activeOrders = orders.filter((o) => activeStatuses.includes(o.status));

    return {
      totalOrders: orders.length,
      totalSpent,
      activeOrdersCount: activeOrders.length,
      savedAddressesCount: user.savedAddresses?.length || 0,
      favoritesCount: user.favoriteProductIds?.length || 0,
    };
  }
}
