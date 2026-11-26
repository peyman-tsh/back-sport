import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { BenchmarkInterceptor } from './common/interceptors/benchmark.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
const compression = require('compression');
const express = require('express');

async function bootstrap() {
  const logger = new Logger('HeadlightBootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // High Performance & Security Middlewares
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  app.use(compression());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: configService.get<string[]>('cors.origins', []),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new BenchmarkInterceptor(), new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Fast Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  // Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('LUMIX SPORT API (فروشگاه آنلاین لوازم اسپرت و تیونینگ خودرو)')
    .setDescription(
      'مستندات جامع API فروشگاه تخصصی لوازم اسپرت، کیت بدنه، اگزوز، مکش، روشنایی و تیونینگ خودرو با معماری تمیز SOLID و پایگاه داده MongoDB',
    )
    .setVersion('2.0')
    .addTag('Sport Products (لوازم اسپرت و تیونینگ خودرو)', 'عملیات جستجو، فیلتر دسته‌بندی‌ها و مدیریت کاتالوگ اسپرت')
    .addTag('Cars & Bulb Fitment (پایه لامپ خودروها)', 'بانک اطلاعات پایه‌های نور بالا، پایین و قطعات فابریک خودروها')
    .addTag('Orders & Checkout (سفارشات و پرداخت)', 'ثبت سفارش، محاسبه ارسال و اتصال به درگاه پرداخت با الگوی Adapter')
    .addTag('Authentication (احراز هویت و ورود)', 'ثبت‌نام و لاگین مشتریان با شماره موبایل و پسورد امن')
    .addTag('Users & Profile (پروفایل مشتریان)', 'مدیریت اطلاعات کاربری، آدرس‌های ارسال و علاقه‌مندی‌ها')
    .addTag('Reviews & Ratings (نظرات و امتیازات نوری هدلایت‌ها)', 'امتیازدهی و ثبت نظرات خریداران')
    .addTag('Coupons & Discounts (کدهای تخفیف)', 'سیستم اعتبارسنجی و اعمال کدهای تخفیف درصدی و مقداری')
    .build();

  if (configService.get<string>('environment') !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port,'0.0.0.0');
  logger.log(`================================================================`);
  logger.log(`🚀 Headlight Backend is running at: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger OpenAPI documentation at: http://localhost:${port}/docs`);
  logger.log(`================================================================`);
}

bootstrap();
