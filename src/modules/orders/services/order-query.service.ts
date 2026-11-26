import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import {
  IOrderRepository,
  IOrderFilterCriteria,
  IOrderFinancialStats,
} from '../interfaces/order-repository.interface';
import { Order } from '../schemas/order.schema';
import { FilterOrdersDto } from '../dto/filter-orders.dto';
import { IPaginatedResult } from '../../../common/interfaces/repository.interface';

/**
 * Single Responsibility Principle (SRP):
 * OrderQueryService is strictly responsible for querying and reporting orders.
 *
 * Dependency Inversion Principle (DIP):
 * Injected with abstract IOrderRepository, zero concrete model dependencies.
 */
@Injectable()
export class OrderQueryService {
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async getFilteredOrders(dto: FilterOrdersDto): Promise<IPaginatedResult<Order>> {
    const criteria: IOrderFilterCriteria = {
      status: dto.status,
      customerPhone: dto.customerPhone,
      orderNumber: dto.orderNumber,
    };

    return this.orderRepository.findFiltered(criteria, {
      page: dto.page,
      limit: dto.limit,
    });
  }

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException(`سفارشی با شماره ${orderNumber} یافت نشد.`);
    }
    return order;
  }

  async getOrderByNumberForUser(orderNumber: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found.');
    }
    return order;
  }

  async getCustomerOrders(phone: string): Promise<Order[]> {
    return this.orderRepository.findByCustomerPhone(phone);
  }

  async getOrdersForUser(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async getFinancialReport(): Promise<IOrderFinancialStats> {
    return this.orderRepository.getFinancialStats();
  }
}
