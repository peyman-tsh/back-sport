import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Performance Monitoring Interceptor:
 * Attaches X-Response-Time header and logs performance metrics.
 */
@Injectable()
export class BenchmarkInterceptor implements NestInterceptor {
  private readonly logger = new Logger('PerformanceBenchmark');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const startTime = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;
        res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);

        if (durationMs > 200) {
          this.logger.warn(`SLOW REQUEST: [${req.method}] ${req.url} - ${durationMs.toFixed(2)}ms`);
        } else {
          this.logger.log(`[${req.method}] ${req.url} - ${durationMs.toFixed(2)}ms`);
        }
      }),
    );
  }
}
