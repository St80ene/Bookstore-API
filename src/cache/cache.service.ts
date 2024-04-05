import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class CacheService {
  private client;
  private readonly logger = new Logger(CacheService.name);

  constructor() {
    // this.client = redis.createClient();
    createClient()
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect()
      .then((conn) => (this.client = conn));
  }

  async setCache({
    key,
    value,
    category,
  }: {
    key: string;
    value: any;
    category?: string[];
  }): Promise<void> {
    return this.client.set(key, JSON.stringify(value));
  }

  async getCache(key): Promise<any> {
    console.log(key);

    const keys = await this.client.keys('*');
    console.log('Cached keys:', keys);
    return this.client.get(key);
  }

  async invalidateCache({
    key,
    category,
  }: {
    key: string;
    category?: string[];
  }): Promise<boolean> {
    return this.flushKeysContainingBooks(key);
  }

  private async flushKeysContainingBooks(pattern: string) {
    try {
      const result = await this.client.store.keys(pattern);

      for (const key of result) {
        await this.client.del(key);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error flushing keys:`, error.stack);
      throw error;
    }
  }
}
