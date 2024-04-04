import { Provider } from '@nestjs/common';
import { responseMiddleware } from './response.middleware';
import { CacheService } from 'src/cache/cache.service';

export const ResponseMiddlewareProvider: Provider = {
  provide: 'ResponseMiddleware',
  useFactory: (cacheService: CacheService) => {
    return responseMiddleware(cacheService);
  },
  inject: [CacheService],
};
