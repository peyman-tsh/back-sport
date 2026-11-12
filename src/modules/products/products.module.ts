import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductController } from './controllers/product.controller';
import { ProductQueryService } from './services/product-query.service';
import { ProductCommandService } from './services/product-command.service';
import { ProductRepository } from './repositories/product.repository';
import { INJECTION_TOKENS } from '../../common/constants/tokens';

/**
 * Dependency Inversion Principle (DIP):
 * We register ProductRepository against the symbol token INJECTION_TOKENS.PRODUCT_REPOSITORY.
 * This guarantees the services depend on abstractions rather than concrete classes.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [
    ProductQueryService,
    ProductCommandService,
    {
      provide: INJECTION_TOKENS.PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductQueryService, ProductCommandService, INJECTION_TOKENS.PRODUCT_REPOSITORY],
})
export class ProductsModule {}
