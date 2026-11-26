import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { Order, OrderStatus } from '../schemas/order.schema';

@Injectable()
export class FulfillmentService {
  constructor(@Inject(INJECTION_TOKENS.ORDER_REPOSITORY) private readonly orders: IOrderRepository) {}

  async updateStatus(orderNumber: string, status: OrderStatus): Promise<Order> {
    const previous: Partial<Record<OrderStatus, OrderStatus>> = {
      PROCESSING: 'PAID',
      SHIPPED: 'PROCESSING',
      DELIVERED: 'SHIPPED',
    };
    const expected = previous[status];
    if (!expected) throw new BadRequestException('Only fulfillment statuses may be set manually.');
    const updated = await this.orders.updateStatus(orderNumber, status, expected);
    if (updated) return updated;
    if (!await this.orders.findByOrderNumber(orderNumber)) {
      throw new NotFoundException(`Order ${orderNumber} not found.`);
    }
    throw new BadRequestException('Invalid order status transition.');
  }
}
