// src/app.ts
import express from "express";

import apiRouter from "./apiRouter";
import { TypeOrmConnection } from "./db/typeorm";
import { iocContainer } from "./ioc";
import { logger } from "./logger";
import { RedisService } from "./redis";

export const app = express();

app.use(apiRouter);
app.disable("x-powered-by");

export const shutdown = async () => {
  const db = iocContainer.get(TypeOrmConnection).getInstance();
  const redis = iocContainer.get(RedisService).redis;
  try {
    await db?.destroy();
    redis.disconnect();
  } catch (err) {
    logger.error(err);
  }
};

