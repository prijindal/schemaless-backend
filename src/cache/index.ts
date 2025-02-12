import { inject } from "inversify";
import { RedisService } from "../redis";
import { singleton } from "../singleton";

@singleton(CacheService)
export class CacheService {
  constructor(@inject(RedisService) private redisService: RedisService) { }


  public async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redisService.redis.get(key);
    if (value == null) {
      return undefined;
    }
    return JSON.parse(value);
  }

  public async set<T>(key: string, value: T, ttl?: string | number) {
    await (ttl
      ? this.redisService.redis.setex(key, ttl, JSON.stringify(value))
      : this.redisService.redis.set(key, JSON.stringify(value)));
  }

  public async remove(key: string): Promise<void> {
    await this.redisService.redis.del(key);
  }

  public async clear(): Promise<void> {
    await this.redisService.redis.flushall();
  }

  public async health(): Promise<boolean> {
    const stats = await this.redisService.redis.status;
    return stats === "ready";
  }
}
