export interface PaymentInitiationResult {
  paymentUrl: string;
  transactionRef: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  refId: string;
  cardPan?: string;
  message: string;
}

/**
 * Open/Closed Principle (OCP):
 * New payment gateways (Zarinpal, Stripe, Saman, Mellat) can be plugged in
 * by simply implementing IPaymentGateway, with zero modification to OrderService!
 */
export interface IPaymentGateway {
  readonly gatewayName: string;

  requestPayment(
    amountToman: number,
    orderId: string,
    customerPhone: string,
    callbackUrl: string,
  ): Promise<PaymentInitiationResult>;

  verifyPayment(
    transactionRef: string,
    amountToman: number,
  ): Promise<PaymentVerificationResult>;

  reversePayment?(transactionRef: string): Promise<boolean>;
}
