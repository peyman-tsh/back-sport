import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order } from '../schemas/order.schema';
import { ProductQueryService } from '../../products/services/product-query.service';
import { ProductInventoryService } from '../../products/services/product-inventory.service';
import { ReservationReleaseService } from './reservation-release.service';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY) private readonly orderRepository: IOrderRepository,
    @Inject(INJECTION_TOKENS.PAYMENT_GATEWAY) private readonly paymentGateway: IPaymentGateway,
    private readonly productQueryService: ProductQueryService,
    private readonly productInventoryService: ProductInventoryService,
    private readonly configService: ConfigService,
    private readonly reservationRelease: ReservationReleaseService,
  ) {}

  async createOrderAndInitiatePayment(dto: CreateOrderDto, userId: string) {
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
        const prodId = product.id || (product as typeof product & { _id?: { toString(): string } })._id?.toString() || item.productId;

        // Atomically lock and reserve stock in database
        const isReserved = await this.productInventoryService.reserveStock(prodId, item.quantity);
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
        await this.productInventoryService.releaseReservedStock(resItem.productId, resItem.quantity).catch(() => null);
      }
      throw error;
    }

    const orderNumber = `HD-${randomUUID()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute reservation window

    let newOrder: Order;
    try {
      newOrder = await this.orderRepository.create({
        userId,
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
    } catch (error) {
      for (const item of reservedItems) {
        try {
          if (!await this.productInventoryService.releaseReservedStock(item.productId, item.quantity)) {
            this.logger.error(`Could not release reservation for product ${item.productId}`);
          }
        } catch (releaseError: unknown) {
          this.logger.error(`Could not release reservation for product ${item.productId}`, releaseError instanceof Error ? releaseError.stack : String(releaseError));
        }
      }
      throw error;
    }

    let paymentResult;
    try {
      paymentResult = await this.paymentGateway.requestPayment(
        totalAmount,
        orderNumber,
        dto.shippingAddress.phoneNumber,
        this.configService.getOrThrow<string>('PAYMENT_CALLBACK_URL'),
      );

      const orderId = newOrder.id || (newOrder as Order & { _id: { toString(): string } })._id.toString();
      const updated = await this.orderRepository.update(orderId, {
        transactionRef: paymentResult.transactionRef,
      });
      if (!updated) throw new Error(`Payment reference could not be saved for ${orderNumber}`);
    } catch (error) {
      try {
        await this.reservationRelease.cancel(newOrder);
      } catch (releaseError: unknown) {
        this.logger.error(`Could not cancel order ${orderNumber}`, releaseError instanceof Error ? releaseError.stack : String(releaseError));
      }
      throw new InternalServerErrorException('Unable to initiate payment. Please try again.');
    }

    return {
      orderNumber: newOrder.orderNumber,
      totalAmount: newOrder.totalAmount,
      paymentUrl: paymentResult.paymentUrl,
      transactionRef: paymentResult.transactionRef,
      reservationExpiresAt: expiresAt,
    };
  }
}
