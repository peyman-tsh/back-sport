import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../common/constants/tokens';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './controllers/admin.controller';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminInventoryService } from './services/admin-inventory.service';

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [
    {
      provide: INJECTION_TOKENS.ADMIN_DASHBOARD_SERVICE,
      useClass: AdminDashboardService,
    },
    {
      provide: INJECTION_TOKENS.ADMIN_INVENTORY_SERVICE,
      useClass: AdminInventoryService,
    },
  ],
  exports: [
    INJECTION_TOKENS.ADMIN_DASHBOARD_SERVICE,
    INJECTION_TOKENS.ADMIN_INVENTORY_SERVICE,
  ],
})
export class AdminModule {}
