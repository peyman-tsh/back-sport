import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { ReviewController } from './controllers/review.controller';
import { ReviewQueryService } from './services/review-query.service';
import { ReviewCommandService } from './services/review-command.service';
import { ReviewRepository } from './repositories/review.repository';
import { INJECTION_TOKENS } from '../../common/constants/tokens';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    ProductsModule,
  ],
  controllers: [ReviewController],
  providers: [
    ReviewQueryService,
    ReviewCommandService,
    {
      provide: INJECTION_TOKENS.REVIEW_REPOSITORY,
      useClass: ReviewRepository,
    },
  ],
  exports: [ReviewQueryService, ReviewCommandService, INJECTION_TOKENS.REVIEW_REPOSITORY],
})
export class ReviewsModule {}
