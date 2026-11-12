import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderController } from './controllers/order.controller';
import { OrderQueryService } from './services/order-query.service';
import { OrderCommandService } from './services/order-command.service';
import { OrderRepository } from './repositories/order.repository';
import { MockPaymentGateway } from './adapters/mock-payment.gateway';
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
    MockPaymentGateway,
    ZarinpalPaymentGateway,
    {
      provide: INJECTION_TOKENS.ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
    {
      provide: INJECTION_TOKENS.PAYMENT_GATEWAY,
      useClass: MockPaymentGateway,
    },
  ],
  exports: [
    OrderQueryService,
    OrderCommandService,
    INJECTION_TOKENS.ORDER_REPOSITORY,
  ],
})
export class OrdersModule {}
