import NodeCache from "node-cache";
import { CacheImplementation } from "./base";

export class NodeCacheImplementation implements CacheImplementation {
  private nodeCache: NodeCache;
  constructor() {
    this.nodeCache = new NodeCache({
      stdTTL: 60,
    });
  }

  public async get<T>(key: string) {
    return this.nodeCache.get<T>(key);
  }

  public async set<T>(key: string, value: T, ttl?: string | number) {
    const stat = ttl
      ? this.nodeCache.set<T>(key, value, ttl)
      : this.nodeCache.set<T>(key, value);
    console.log(stat);
  }

  public async remove(key: string): Promise<void> {
    this.nodeCache.del(key);
  }

  public async clear(): Promise<void> {
    this.nodeCache.flushAll();
  }

  public async stats(): Promise<{ keys: number; }> {
    const stats = this.nodeCache.getStats();
    return {
      keys: stats.keys,
    }
  }
}
