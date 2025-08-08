import { createClient } from 'redis';
import { ICachePort } from '../../domain/interfaces/cache.port';

export class RedisCacheAdapter implements ICachePort {
  private client = createClient({ url: process.env.REDIS_URL });
  private ready = this.client.connect();
  async get<T>(key: string): Promise<T | null> {
    await this.ready;
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }
  async set<T>(key: string, value: T, ttlSec: number) {
    await this.ready;
    await this.client.set(key, JSON.stringify(value), { EX: ttlSec });
  }
}
