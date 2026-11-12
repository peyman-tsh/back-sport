import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        dbName: configService.get<string>('mongodb.dbName'),
        maxPoolSize: configService.get<number>('mongodb.maxPoolSize'),
        minPoolSize: configService.get<number>('mongodb.minPoolSize'),
        autoIndex: process.env.NODE_ENV !== 'production', // Keep fast startup in prod
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        waitQueueTimeoutMS: 5000,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
