// src/app.ts
import express from "express";

import apiRouter from "./apiRouter";
import { TypeOrmConnection } from "./db/typeorm";
import { iocContainer } from "./ioc";
import { logger } from "./logger";

export const app = express();

app.use(apiRouter);
app.disable("x-powered-by");

export const shutdown = async () => {
  const db = iocContainer.get(TypeOrmConnection).getInstance();
  try {
    await db?.destroy();
  } catch (err) {
    logger.error(err);
  }
};

