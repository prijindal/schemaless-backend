export abstract class CacheImplementation {
    public abstract get<T>(key: string): Promise<T | undefined>;
    public abstract set<T>(key: string, value: T, ttl?: string | number): Promise<void>;

    public abstract remove(key: string): Promise<void>;
    public abstract clear(): Promise<void>;

    public abstract health(): Promise<boolean>;
}