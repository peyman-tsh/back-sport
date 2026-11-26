import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { CarsModule } from './modules/cars/cars.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { AdminModule } from './modules/admin/admin.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: (env) => {
        if (env.NODE_ENV === 'production') {
          const required = [
            'JWT_SECRET',
            'JWT_REFRESH_SECRET',
            'MONGODB_URI',
            'CORS_ORIGINS',
            'PAYMENT_CALLBACK_URL',
            'ZARINPAL_MERCHANT_ID',
            'FRONTEND_URL',
            'REVALIDATE_SECRET',
          ];
          const missing = required.filter((key) => !env[key]?.trim());
          if (missing.length > 0) {
            throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
          }
          if (env.CORS_ORIGINS.split(',').some((origin: string) => origin.trim() === '*')) {
            throw new Error('CORS_ORIGINS must not contain a wildcard in production.');
          }
          if (!env.PAYMENT_CALLBACK_URL.startsWith('https://')) {
            throw new Error('PAYMENT_CALLBACK_URL must use HTTPS in production.');
          }
        }
        return env;
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 80,
      },
    ]),
    DatabaseModule,
    ProductsModule,
    CarsModule,
    OrdersModule,
    UsersModule,
    AuthModule,
    ReviewsModule,
    CouponsModule,
    AdminModule,
    CategoriesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
