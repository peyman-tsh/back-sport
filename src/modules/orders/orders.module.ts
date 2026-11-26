import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderController } from './controllers/order.controller';
import { OrderQueryService } from './services/order-query.service';
import { OrderCommandService } from './services/order-command.service';
import { PaymentFinalizationService } from './services/payment-finalization.service';
import { ReservationExpiryService } from './services/reservation-expiry.service';
import { ReservationReleaseService } from './services/reservation-release.service';
import { CheckoutService } from './services/checkout.service';
import { PaymentVerificationService } from './services/payment-verification.service';
import { FulfillmentService } from './services/fulfillment.service';
import { OrderRepository } from './repositories/order.repository';
import { ZarinpalPaymentGateway } from './adapters/zarinpal.gateway';
import { INJECTION_TOKENS } from '../../common/constants/tokens';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderQueryService,
    OrderCommandService,
    CheckoutService,
    PaymentVerificationService,
    FulfillmentService,
    PaymentFinalizationService,
    ReservationExpiryService,
    ReservationReleaseService,
    ZarinpalPaymentGateway,
    {
      provide: INJECTION_TOKENS.ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
    {
      provide: INJECTION_TOKENS.PAYMENT_GATEWAY,
      useExisting: ZarinpalPaymentGateway,
    },
  ],
  exports: [
    OrderQueryService,
    OrderCommandService,
    INJECTION_TOKENS.ORDER_REPOSITORY,
  ],
})
export class OrdersModule {}
