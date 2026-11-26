import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { PaymentFinalizationService } from './payment-finalization.service';
import { ReservationReleaseService } from './reservation-release.service';

@Injectable()
export class PaymentVerificationService {
  private readonly logger = new Logger(PaymentVerificationService.name);
  constructor(
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY) private readonly orderRepository: IOrderRepository,
    @Inject(INJECTION_TOKENS.PAYMENT_GATEWAY) private readonly paymentGateway: IPaymentGateway,
    private readonly paymentFinalization: PaymentFinalizationService,
    private readonly reservationRelease: ReservationReleaseService,
  ) {}

  async verifyPayment(authority: string, _status: string) {
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

    // Callback query parameters are untrusted; the gateway is the source of truth.
    const verification = await this.paymentGateway.verifyPayment(
      authority,
      order.totalAmount,
    );

    if (verification.success) {
      if (order.status !== 'PENDING') {
        throw new ConflictException('Payment succeeded for an order that is no longer pending; manual reconciliation is required.');
      }
      try {
        await this.paymentFinalization.finalize(order, verification.refId);
      } catch (err: unknown) {
        this.logger.error(`Critical transaction failure on order ${order.orderNumber}:`, err instanceof Error ? err.stack : String(err));
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
      if (order.status === 'PENDING') await this.reservationRelease.cancel(order);

      return {
        success: false,
        orderNumber: order.orderNumber,
        message: verification.message || 'خطا در تایید تراکنش بانکی.',
      };
    }
  }
}
