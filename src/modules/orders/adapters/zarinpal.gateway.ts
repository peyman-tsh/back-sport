import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentGateway,
  PaymentInitiationResult,
  PaymentVerificationResult,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class ZarinpalPaymentGateway implements IPaymentGateway {
  readonly gatewayName = 'ZARINPAL';
  private readonly logger = new Logger(ZarinpalPaymentGateway.name);

  async requestPayment(
    amountToman: number,
    orderId: string,
    customerPhone: string,
    callbackUrl: string,
  ): Promise<PaymentInitiationResult> {
    this.logger.log(`[ZarinPal] Requesting payment authority for ${amountToman} Toman`);
    // In production: fetch('https://payment.zarinpal.com/pg/v4/payment/request.json', {...})
    const authority = `A00000000000000000000000000${Date.now()}`.slice(0, 36);
    return {
      paymentUrl: `https://payment.zarinpal.com/pg/StartPay/${authority}`,
      transactionRef: authority,
    };
  }

  async verifyPayment(
    transactionRef: string,
    amountToman: number,
  ): Promise<PaymentVerificationResult> {
    this.logger.log(`[ZarinPal] Verifying authority: ${transactionRef} for ${amountToman} Toman`);
    return {
      success: true,
      refId: `ZP-${Math.floor(Math.random() * 9000000 + 1000000)}`,
      message: 'تراکنش زرین‌پال تایید گردید.',
    };
  }
}
