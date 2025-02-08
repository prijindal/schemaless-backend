import { CacheImplementation } from "./base";

export class NoCacheImplementation implements CacheImplementation {
  public async get() {
    return undefined;
  }

  public async set() {}

  public async remove() {}

  public async clear() {
  }

  public async stats(): Promise<{ keys: number; }> {
    return {
      keys: 0,
    }
  }
}
