import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentGateway,
  PaymentInitiationResult,
  PaymentVerificationResult,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class MockPaymentGateway implements IPaymentGateway {
  readonly gatewayName = 'MOCK_SANDBOX';
  private readonly logger = new Logger(MockPaymentGateway.name);

  async requestPayment(
    amountToman: number,
    orderId: string,
    customerPhone: string,
    callbackUrl: string,
  ): Promise<PaymentInitiationResult> {
    const fakeAuthority = `MOCK-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.logger.log(
      `[MockPayment] Generated fake gateway session for Order ${orderId}, Amount: ${amountToman.toLocaleString()} Toman`,
    );

    return {
      paymentUrl: `${callbackUrl}?authority=${fakeAuthority}&status=OK`,
      transactionRef: fakeAuthority,
    };
  }

  async verifyPayment(
    transactionRef: string,
    amountToman: number,
  ): Promise<PaymentVerificationResult> {
    this.logger.log(`[MockPayment] Auto-verifying transaction: ${transactionRef} for ${amountToman} Toman`);
    return {
      success: true,
      refId: `REF-${Date.now()}`,
      cardPan: '6037-****-****-1234',
      message: 'پرداخت با موفقیت در محیط شبیه‌ساز انجام شد.',
    };
  }
}
