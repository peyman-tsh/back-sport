import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { ReservationReleaseService } from './reservation-release.service';

@Injectable()
export class ReservationExpiryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReservationExpiryService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY) private readonly orders: IOrderRepository,
    private readonly release: ReservationReleaseService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      if (this.running) return;
      this.running = true;
      this.releaseExpiredOrders()
        .catch((error: unknown) => this.logger.error('Failed to release expired orders', error instanceof Error ? error.stack : String(error)))
        .finally(() => { this.running = false; });
    }, 60000);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async releaseExpiredOrders(): Promise<number> {
    const orders = await this.orders.findExpiredReservedOrders();
    let released = 0;
    for (const order of orders) {
      try {
        if (await this.release.expire(order)) released++;
      } catch (error: unknown) {
        this.logger.error(`Failed to expire order ${order.orderNumber}`, error instanceof Error ? error.stack : String(error));
      }
    }
    return released;
  }
}
