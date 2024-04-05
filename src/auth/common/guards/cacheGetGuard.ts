import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class CacheGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { originalUrl } = request; // Get the original URL of the request

    const cachedData = await this.cache.get(originalUrl);

    if (cachedData) {
      response.status(200).json(cachedData);
      return false; // Return false to prevent hitting the route
    }

    return true;
  }
}
