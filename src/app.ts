// src/app.ts
import { createRequestHandler } from "@remix-run/express";
import express from "express";

// @ts-ignore
import * as build from "../build/server";

import apiRouter from "./apiRouter";
import { TypeOrmConnection } from "./db/typeorm";
import { iocContainer } from "./ioc";
import { logger } from "./logger";

export const app = express();

app.use(express.static("build/client"));

app.use(apiRouter);
app.disable("x-powered-by");

app.all("*", createRequestHandler({ build }));

export const shutdown = async () => {
  const db = iocContainer.get(TypeOrmConnection).getInstance();
  try {
    await db?.destroy();
  } catch (err) {
    logger.error(err);
  }
};

