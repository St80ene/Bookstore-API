import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class FormatResponse implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const cacheKey = req.originalUrl;

    let catchedData = await this.cache.get(cacheKey);

    if (catchedData) {
      try {
        //
      } catch (error) {
        console.error(error);
      }
    }

    next();
  }
}
