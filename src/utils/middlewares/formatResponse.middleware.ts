import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FormatResponse implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function (this: Response, body?: any): Response {
      const responseBody = {
        status: res.statusCode,
        message: 'Success',
        data: body,
      };

      // console.log(body);
      // res.set('Content-Type', 'application/json');

      // Check if it's a PUT or POST request
      // if (req.method === 'PUT' || req.method === 'POST') {
      //   // Invalidate cache for the corresponding endpoint
      //   cacheService.invalidateCache(req.originalUrl + '*');
      // }

      // Call the original send method with the modified body
      return res.set('Content-Type', 'application/json').send(responseBody);
      // return originalSend.call(this, responseBody);
    };

    next();
  }
}

// import { Request, Response, NextFunction } from 'express';
// import { CacheService } from 'src/cache/cache.service';

// export function responseMiddleware(cacheService: CacheService) {
//   return async function (req: Request, res: Response, next: NextFunction) {
//     const originalSend = res.send;

//     res.send = function (this: Response, body?: any): Response {
//       const responseBody = {
//         status: res.statusCode,
//         message: 'Success',
//         data: body,
//       };

//       console.log(body);

//       // Check if it's a PUT or POST request
//       // if (req.method === 'PUT' || req.method === 'POST') {
//       //   // Invalidate cache for the corresponding endpoint
//       //   cacheService.invalidateCache(req.originalUrl + '*');
//       // }

//       // Call the original send method with the modified body
//       return originalSend.call(this, responseBody);
//     };

//     next();
//   };
// }
