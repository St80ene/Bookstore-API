import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class CacheGuard implements CanActivate {
  constructor(private cacheService: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { originalUrl } = request; // Get the original URL of the request

    // Check if the URL exists in the cache
    const cachedData = await this.cacheService.getCache(originalUrl);

    // If cached data exists, return the data
    if (cachedData) {
      request.cachedData = cachedData;
      return true;
    }

    return true;
  }
}
