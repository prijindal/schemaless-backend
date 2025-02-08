import { CACHE_IMPLEMENTATION } from "../config";
import { logger } from "../logger";
import { singleton } from "../singleton";
import { CacheImplementation } from "./base";
import { NoCacheImplementation } from "./noCache";
import { NodeCacheImplementation } from "./nodeCache";

@singleton(CacheService)
export class CacheService implements CacheImplementation {
  private cacheImplmentation: CacheImplementation;
  constructor() {
    // We can checkout new implemntation from this, Example: redis/sql etc
    logger.info(`Using Cache implementation: ${CACHE_IMPLEMENTATION}`)
    switch(CACHE_IMPLEMENTATION) {
      case "node-cache":
        this.cacheImplmentation = new NodeCacheImplementation();
        return;
      case "no":
      default:
        this.cacheImplmentation = new NoCacheImplementation();
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

  public stats(): Promise<{ keys: number; }> {
    return this.cacheImplmentation.stats();
  }
}
