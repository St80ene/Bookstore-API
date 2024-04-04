import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private client: RedisClientType<any>;
  private readonly logger = new Logger(CacheService.name);
  constructor() {
    createClient({
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
      },
    })
      .on('error', (err) =>
        this.logger.error(`Redis Client Error: ${err}`, err.stack)
      )
      .connect()
      .then((conn) => {
        //@ts-expect-error
        this.client = conn;
      });
  }

  async setCache(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async getCache(key: string): Promise<any> {
    const cachedData = await this.client.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  async invalidateCache(endpoint: string): Promise<void> {
    // Get all cache keys associated with the endpoint
    const keys = await this.client.keys(`${endpoint}*`);
    // Delete all cache keys associated with the endpoint
    await Promise.all(keys.map((key) => this.client.del(key)));
  }
}
