import { Request, Response, NextFunction } from 'express';
import { CacheService } from 'src/cache/cache.service';

export function responseMiddleware(cacheService: CacheService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function (this: Response, body?: any): Response {
      const responseBody = {
        status: res.statusCode,
        message: 'Success',
        data: body,
      };

      // Check if it's a PUT or POST request
      if (req.method === 'PUT' || req.method === 'POST') {
        // Invalidate cache for the corresponding endpoint
        cacheService.invalidateCache(req.originalUrl + '*');
      }

      // Call the original send method with the modified body
      return originalSend.call(this, responseBody);
    };

    next();
  };
}
