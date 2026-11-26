import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Order, OrderStatus } from '../schemas/order.schema';
import { CheckoutService } from './checkout.service';
import { PaymentVerificationService } from './payment-verification.service';
import { FulfillmentService } from './fulfillment.service';

/** Keeps the public API stable while each use case owns its business rules. */
@Injectable()
export class OrderCommandService {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly payments: PaymentVerificationService,
    private readonly fulfillment: FulfillmentService,
  ) {}

  createOrderAndInitiatePayment(dto: CreateOrderDto, userId: string) {
    return this.checkout.createOrderAndInitiatePayment(dto, userId);
  }

  verifyPayment(authority: string, status: string) {
    return this.payments.verifyPayment(authority, status);
  }

  updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<Order> {
    return this.fulfillment.updateStatus(orderNumber, status);
  }
}
