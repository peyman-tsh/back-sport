import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FrontendRevalidationService {
  private readonly logger = new Logger(FrontendRevalidationService.name);

  constructor(private readonly config: ConfigService) {}

  async revalidate(slug?: string): Promise<void> {
    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    const secret = this.config.get<string>('REVALIDATE_SECRET');
    if (!frontendUrl || !secret) return;
    try {
      const response = await fetch(`${frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
        body: JSON.stringify({ path: slug ? `/products/${slug}` : '/products' }),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) this.logger.warn(`Frontend revalidation returned HTTP ${response.status}`);
    } catch (error: unknown) {
      this.logger.warn(`Frontend revalidation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
