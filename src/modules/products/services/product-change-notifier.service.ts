import { Inject, Injectable } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IProductCache } from '../interfaces/product-cache.interface';
import { IProductChangeNotifier } from '../interfaces/product-change-notifier.interface';
import { FrontendRevalidationService } from './frontend-revalidation.service';

@Injectable()
export class ProductChangeNotifierService implements IProductChangeNotifier {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_CACHE)
    private readonly cache: IProductCache,
    private readonly frontendRevalidation: FrontendRevalidationService,
  ) {}

  notify(...slugs: string[]): void {
    this.cache.invalidate();
    void this.frontendRevalidation.revalidate();
    this.revalidateSlugs(...slugs);
  }

  revalidateSlugs(...slugs: string[]): void {
    for (const slug of new Set(slugs.filter(Boolean))) {
      void this.frontendRevalidation.revalidate(slug);
    }
  }
}
