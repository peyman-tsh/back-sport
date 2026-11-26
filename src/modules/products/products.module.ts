import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductController } from './controllers/product.controller';
import { ProductQueryService } from './services/product-query.service';
import { ProductCommandService } from './services/product-command.service';
import { FrontendRevalidationService } from './services/frontend-revalidation.service';
import { ProductCacheService } from './services/product-cache.service';
import { ProductChangeNotifierService } from './services/product-change-notifier.service';
import { ProductInventoryService } from './services/product-inventory.service';
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
    ProductInventoryService,
    { provide: INJECTION_TOKENS.PRODUCT_CACHE, useClass: ProductCacheService },
    { provide: INJECTION_TOKENS.PRODUCT_CHANGE_NOTIFIER, useClass: ProductChangeNotifierService },
    FrontendRevalidationService,
    {
      provide: INJECTION_TOKENS.PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductQueryService, ProductCommandService, ProductInventoryService, INJECTION_TOKENS.PRODUCT_REPOSITORY],
})
export class ProductsModule {}
