import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentGateway,
  PaymentInitiationResult,
  PaymentVerificationResult,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class ZarinpalPaymentGateway implements IPaymentGateway {
  readonly gatewayName = 'ZARINPAL';
  private readonly logger = new Logger(ZarinpalPaymentGateway.name);
  private readonly sandbox: boolean;
  private readonly amountMultiplier: number;

  constructor(private readonly configService: ConfigService) {
    this.sandbox = this.configService.get<string>('ZARINPAL_SANDBOX', 'false') === 'true';
    this.amountMultiplier = Number(this.configService.get<string>('ZARINPAL_AMOUNT_MULTIPLIER', '10'));
    if (!Number.isInteger(this.amountMultiplier) || this.amountMultiplier <= 0) {
      throw new Error('ZARINPAL_AMOUNT_MULTIPLIER must be a positive integer.');
    }
  }

  private get apiBaseUrl() {
    return this.sandbox ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com';
  }

  private get paymentBaseUrl() {
    return this.sandbox ? 'https://sandbox.zarinpal.com' : 'https://www.zarinpal.com';
  }

  private toGatewayAmount(amountToman: number) {
    return amountToman * this.amountMultiplier;
  }

  private async post(path: string, body: Record<string, unknown>): Promise<any> {
    let response: Response;
    try {
      response = await fetch(`${this.apiBaseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      this.logger.error(`ZarinPal request failed for ${path}`, error instanceof Error ? error.stack : undefined);
      throw new Error('Payment gateway is unavailable.');
    }

    if (!response.ok) {
      this.logger.error(`ZarinPal returned HTTP ${response.status} for ${path}`);
      throw new Error('Payment gateway rejected the request.');
    }

    return response.json();
  }

  async requestPayment(
    amountToman: number,
    orderId: string,
    customerPhone: string,
    callbackUrl: string,
  ): Promise<PaymentInitiationResult> {
    const merchantId = this.configService.get<string>('ZARINPAL_MERCHANT_ID');
    if (!merchantId) {
      throw new Error('ZARINPAL_MERCHANT_ID is not configured.');
    }
    const result = await this.post('/pg/v4/payment/request.json', {
      merchant_id: merchantId,
      amount: this.toGatewayAmount(amountToman),
      callback_url: callbackUrl,
      description: `Order ${orderId}`,
      metadata: { mobile: customerPhone },
    });
    const authority = result?.data?.authority;
    if (result?.data?.code !== 100 || typeof authority !== 'string') {
      this.logger.error(`ZarinPal payment request was rejected: ${JSON.stringify(result?.errors || result?.data)}`);
      throw new Error('Payment gateway rejected the request.');
    }

    return {
      paymentUrl: `${this.paymentBaseUrl}/pg/StartPay/${authority}`,
      transactionRef: authority,
    };
  }

  async verifyPayment(
    transactionRef: string,
    amountToman: number,
  ): Promise<PaymentVerificationResult> {
    const merchantId = this.configService.get<string>('ZARINPAL_MERCHANT_ID');
    if (!merchantId) {
      throw new Error('ZARINPAL_MERCHANT_ID is not configured.');
    }
    const result = await this.post('/pg/v4/payment/verify.json', {
      merchant_id: merchantId,
      amount: this.toGatewayAmount(amountToman),
      authority: transactionRef,
    });
    const code = result?.data?.code;
    const isVerified = code === 100 || code === 101;
    return {
      success: isVerified,
      refId: String(result?.data?.ref_id || transactionRef),
      cardPan: result?.data?.card_pan,
      message: isVerified ? 'Payment verified.' : 'Payment verification failed.',
    };
  }
}
