import Redis from "ioredis";
import { REDIS_URI } from "../config";
import { singleton } from "../singleton";

@singleton(RedisService)
export class RedisService {
  redis: Redis;
  constructor() {
    this.redis = new Redis(REDIS_URI);
  }
}