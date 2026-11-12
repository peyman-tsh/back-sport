import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './controllers/user.controller';
import { UserQueryService } from './services/user-query.service';
import { UserCommandService } from './services/user-command.service';
import { UserDashboardService } from './services/user-dashboard.service';
import { UserRepository } from './repositories/user.repository';
import { INJECTION_TOKENS } from '../../common/constants/tokens';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OrdersModule,
  ],
  controllers: [UserController],
  providers: [
    UserQueryService,
    UserCommandService,
    {
      provide: INJECTION_TOKENS.USER_DASHBOARD_SERVICE,
      useClass: UserDashboardService,
    },
    {
      provide: INJECTION_TOKENS.USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [
    UserQueryService,
    UserCommandService,
    INJECTION_TOKENS.USER_REPOSITORY,
    INJECTION_TOKENS.USER_DASHBOARD_SERVICE,
  ],
})
export class UsersModule {}
