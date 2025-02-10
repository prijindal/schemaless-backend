import { inject } from "inversify";
import { CACHE_IMPLEMENTATION } from "../config";
import { logger } from "../logger";
import { singleton } from "../singleton";
import { CacheImplementation } from "./base";
import { NodeCacheImplementation } from "./nodeCache";
import { RedisCacheImplementation } from "./redisCache";

@singleton(CacheService)
export class CacheService implements CacheImplementation {
  private cacheImplmentation: CacheImplementation;
  constructor(@inject(RedisCacheImplementation) private redisCacheImplementation: RedisCacheImplementation) {
    // We can checkout new implemntation from this, Example: redis/sql etc
    logger.info(`Using Cache implementation: ${CACHE_IMPLEMENTATION}`)
    switch (CACHE_IMPLEMENTATION) {
      case "redis":
        this.cacheImplmentation = redisCacheImplementation;
        return;
      case "node-cache":
      default:
        this.cacheImplmentation = new NodeCacheImplementation();
        return;
    }
  }

  public get<T>(key: string) {
    return this.cacheImplmentation.get<T>(key);
  }

  public set<T>(key: string, value: T, ttl?: string | number) {
    return this.cacheImplmentation.set<T>(key, value, ttl);
  }

  public remove(key: string): Promise<void> {
    return this.cacheImplmentation.remove(key);
  }

  public clear(): Promise<void> {
    return this.cacheImplmentation.clear();
  }

  public health(): Promise<boolean> {
    return this.cacheImplmentation.health();
  }
}
