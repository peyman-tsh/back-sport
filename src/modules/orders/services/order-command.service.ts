import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order, OrderStatus } from '../schemas/order.schema';
import { ProductQueryService } from '../../products/services/product-query.service';
import { ProductCommandService } from '../../products/services/product-command.service';

/**
 * Single Responsibility Principle (SRP):
 * OrderCommandService handles all mutations and lifecycle transitions of orders.
 * Equipped with Atomic Stock Reservation (TTL) and ACID Transaction verification.
 */
@Injectable()
export class OrderCommandService implements OnModuleInit {
  private readonly logger = new Logger('OrderCommandService');

  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(INJECTION_TOKENS.PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    private readonly productQueryService: ProductQueryService,
    private readonly productCommandService: ProductCommandService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  onModuleInit() {
    // Background worker to release expired stock reservations every 60 seconds
    setInterval(async () => {
      try {
        const released = await this.releaseExpiredOrders();
        if (released > 0) {
          this.logger.log(`Released stock for ${released} expired pending order(s).`);
        }
      } catch (err: any) {
        this.logger.error('Failed to release expired orders', err?.stack);
      }
    }, 60000);
  }

  async createOrderAndInitiatePayment(dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('سبد خرید نمی‌تواند خالی باشد.');
    }

    let totalAmount = 0;
    const populatedItems = [];
    const reservedItems: { productId: string; quantity: number }[] = [];

    // Atomic Stock Reservation Phase
    try {
      for (const item of dto.items) {
        const product = await this.productQueryService.getProductById(item.productId);
        const prodId = product.id || (product as any)._id?.toString() || item.productId;

        // Atomically lock and reserve stock in database
        const isReserved = await this.productCommandService.reserveStock(prodId, item.quantity);
        if (!isReserved) {
          throw new BadRequestException(
            `متاسفانه در همین لحظه موجودی قطعه "${product.title}" توسط خریدار دیگری رزرو شد یا برای تعداد درخواستی (${item.quantity}) کافی نیست.`,
          );
        }

        reservedItems.push({ productId: prodId, quantity: item.quantity });

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        populatedItems.push({
          productId: prodId,
          title: product.title,
          socketType: product.socketType,
          unitPrice: product.price,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }
    } catch (error) {
      // Rollback any items reserved in this loop so far
      for (const resItem of reservedItems) {
        await this.productCommandService.releaseReservedStock(resItem.productId, resItem.quantity).catch(() => null);
      }
      throw error;
    }

    const orderNumber = `HD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute reservation window

    const newOrder = await this.orderRepository.create({
      orderNumber,
      items: populatedItems,
      shippingAddress: dto.shippingAddress,
      totalAmount,
      shippingCost: totalAmount > 2000000 ? 0 : 50000,
      status: 'PENDING',
      isStockReserved: true,
      expiresAt,
      paymentGateway: this.paymentGateway.gatewayName,
    });

    const paymentResult = await this.paymentGateway.requestPayment(
      totalAmount,
      orderNumber,
      dto.shippingAddress.phoneNumber,
      dto.callbackUrl,
    );

    await this.orderRepository.update(newOrder.id || (newOrder as any)._id, {
      transactionRef: paymentResult.transactionRef,
    });

    return {
      orderNumber: newOrder.orderNumber,
      totalAmount: newOrder.totalAmount,
      paymentUrl: paymentResult.paymentUrl,
      transactionRef: paymentResult.transactionRef,
      reservationExpiresAt: expiresAt,
    };
  }

  async verifyPayment(authority: string, status: string) {
    const order = await this.orderRepository.findByTransactionRef(authority);
    if (!order) {
      throw new NotFoundException('سفارش با این مشخصات تراکنش یافت نشد.');
    }

    if (order.status === 'PAID') {
      return {
        success: true,
        orderNumber: order.orderNumber,
        message: 'این سفارش قبلاً با موفقیت پرداخت شده است.',
      };
    }

    // User cancelled payment at gateway
    if (status !== 'OK') {
      if (order.isStockReserved) {
        for (const item of order.items) {
          await this.productCommandService.releaseReservedStock(item.productId, item.quantity).catch(() => null);
        }
      }

      await this.orderRepository.update(order.id || (order as any)._id, {
        status: 'CANCELLED',
        isStockReserved: false,
      });

      return {
        success: false,
        orderNumber: order.orderNumber,
        message: 'پرداخت توسط کاربر لغو گردید و موجودی رزرو شده آزاد شد.',
      };
    }

    const verification = await this.paymentGateway.verifyPayment(
      authority,
      order.totalAmount,
    );

    if (verification.success) {
      try {
        await this.executeAtomicPaymentVerification(order, verification);
      } catch (err: any) {
        this.logger.error(`Critical transaction failure on order ${order.orderNumber}:`, err?.stack);
        if (this.paymentGateway.reversePayment) {
          await this.paymentGateway.reversePayment(authority).catch(() => null);
        }
        throw new InternalServerErrorException('خطا در نهایی‌سازی تراکنش بانکی و انبارداری.');
      }

      return {
        success: true,
        orderNumber: order.orderNumber,
        refId: verification.refId,
        message: 'پرداخت با موفقیت انجام شد و سفارش شما ثبت گردید.',
      };
    } else {
      // Verification failed
      if (order.isStockReserved) {
        for (const item of order.items) {
          await this.productCommandService.releaseReservedStock(item.productId, item.quantity).catch(() => null);
        }
      }

      await this.orderRepository.update(order.id || (order as any)._id, {
        status: 'CANCELLED',
        isStockReserved: false,
      });

      return {
        success: false,
        orderNumber: order.orderNumber,
        message: verification.message || 'خطا در تایید تراکنش بانکی.',
      };
    }
  }

  private async executeAtomicPaymentVerification(
    order: Order,
    verification: { refId: string },
  ): Promise<void> {
    const orderId = order.id || (order as any)._id;

    // 1. Try native MongoDB transaction session if supported by cluster
    let session: any = null;
    try {
      session = await this.connection.startSession();
    } catch {
      session = null;
    }

    if (session) {
      try {
        await session.withTransaction(async () => {
          for (const item of order.items) {
            if (order.isStockReserved) {
              await this.productCommandService.finalizeReservedStock(item.productId, item.quantity);
            } else {
              await this.productCommandService.deductStock(item.productId, item.quantity);
            }
          }

          await this.orderRepository.update(orderId, {
            status: 'PAID',
            isStockReserved: false,
            paymentRefId: verification.refId,
            paidAt: new Date(),
          });
        });
        await session.endSession();
        return;
      } catch (err: any) {
        await session.endSession();
        if (
          err?.message?.includes('replica set') ||
          err?.message?.includes('Transaction numbers are only allowed')
        ) {
          this.logger.warn('MongoDB transactions not active on standalone instance. Falling back to defensive compensation.');
        } else {
          throw err;
        }
      }
    }

    // 2. Defensive Compensation Fallback for standalone dev instances
    for (const item of order.items) {
      if (order.isStockReserved) {
        await this.productCommandService.finalizeReservedStock(item.productId, item.quantity);
      } else {
        await this.productCommandService.deductStock(item.productId, item.quantity);
      }
    }

    await this.orderRepository.update(orderId, {
      status: 'PAID',
      isStockReserved: false,
      paymentRefId: verification.refId,
      paidAt: new Date(),
    });
  }

  async releaseExpiredOrders(): Promise<number> {
    const expiredOrders = await this.orderRepository.findExpiredReservedOrders();
    let releasedCount = 0;

    for (const order of expiredOrders) {
      if (order.isStockReserved && order.items) {
        for (const item of order.items) {
          await this.productCommandService.releaseReservedStock(item.productId, item.quantity).catch(() => null);
        }
      }

      await this.orderRepository.update(order.id || (order as any)._id, {
        status: 'EXPIRED' as OrderStatus,
        isStockReserved: false,
      });

      releasedCount++;
    }

    return releasedCount;
  }

  async updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<Order> {
    const updated = await this.orderRepository.updateStatus(orderNumber, status);
    if (!updated) {
      throw new NotFoundException(`سفارش شماره ${orderNumber} یافت نشد.`);
    }
    return updated;
  }
}
