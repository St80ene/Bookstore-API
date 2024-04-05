import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
  ExceptionFilter,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  HttpArgumentsHost,
  NestInterceptor,
} from '@nestjs/common/interfaces';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { CacheService } from 'src/cache/cache.service';

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
          this.cache.set(request.url, modifiedData).then(() => {});
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
