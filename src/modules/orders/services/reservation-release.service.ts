import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { ProductInventoryService } from '../../products/services/product-inventory.service';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { Order } from '../schemas/order.schema';

@Injectable()
export class ReservationReleaseService {
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY) private readonly orders: IOrderRepository,
    private readonly products: ProductInventoryService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async cancel(order: Order): Promise<boolean> {
    return this.release(order, (id, session) => this.orders.cancelIfPending(id, session));
  }

  async expire(order: Order): Promise<boolean> {
    return this.release(order, (id, session) => this.orders.expireReservationIfPending(id, session));
  }

  private async release(
    order: Order,
    transition: (id: string, session: import('mongoose').ClientSession) => Promise<Order | null>,
  ): Promise<boolean> {
    const id = order.id || (order as Order & { _id: { toString(): string } })._id.toString();
    const session = await this.connection.startSession();
    let changed = false;
    try {
      await session.withTransaction(async () => {
        changed = false;
        const previous = await transition(id, session);
        if (!previous) return;
        for (const item of previous.items) {
          if (!await this.products.releaseReservedStock(item.productId, item.quantity, session)) {
            throw new ConflictException(`Reservation for product ${item.productId} could not be released.`);
          }
        }
        changed = true;
      });
      if (changed) this.products.notifyStockChanges(...order.items.map((item) => item.productId));
      return changed;
    } finally {
      await session.endSession();
    }
  }
}
