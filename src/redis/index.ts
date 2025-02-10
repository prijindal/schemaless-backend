import Redis from "ioredis";
import { REDIS_URI } from "../config";
import { logger } from "../logger";
import { singleton } from "../singleton";

@singleton(RedisService)
export class RedisService {
  redis: Redis;
  constructor() {
    this.redis = new Redis(REDIS_URI);
    this.redis.on("error", (error) => {
      logger.error(error);
    })
  }
}