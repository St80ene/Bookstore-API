import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cache } from 'cache-manager';

@Injectable()
export class FormatResponseFilter implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        const method = request.method;
        // Modify the response body here
        let modifiedData = {
          status: 'Success',
          data: data.result,
        };

        if (method === 'GET') {
          this.cache.set(request.url, modifiedData);
        } else if (data.cacheKey) {
          this.invalidateCache(data.cacheKey);
        }

        return modifiedData;
      })
    );
  }

  async invalidateCache(url: string) {
    const keys = await this.cache.store.keys();
    keys.forEach((key) => {
      if (key.startsWith(url)) {
        this.cache.del(key);
      }
    });
  }
}
