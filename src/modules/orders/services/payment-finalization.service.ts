import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { ProductInventoryService } from '../../products/services/product-inventory.service';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { Order } from '../schemas/order.schema';

@Injectable()
export class PaymentFinalizationService {
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY) private readonly orders: IOrderRepository,
    private readonly products: ProductInventoryService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async finalize(order: Order, refId: string): Promise<void> {
    const orderId = order.id || (order as Order & { _id: { toString(): string } })._id.toString();
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          const finalized = order.isStockReserved
            ? await this.products.finalizeReservedStock(item.productId, item.quantity, session)
            : await this.products.deductStock(item.productId, item.quantity, session);
          if (!finalized) throw new ConflictException('The stock reservation is no longer valid.');
        }
        if (!(await this.orders.markPaidIfPending(orderId.toString(), refId, new Date(), session))) {
          throw new ConflictException('The order is no longer pending.');
        }
      });
      this.products.notifyStockChanges(...order.items.map((item) => item.productId));
    } finally {
      await session.endSession();
    }
  }
}
