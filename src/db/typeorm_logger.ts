/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Logger } from "typeorm";
import { logger } from "../logger";

export class PinoTypeormLogger implements Logger {
  logQuery(query: string, parameters?: any[]) {
    logger.debug({ query, parameters });
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    logger.error(error);
    logger.debug({ query, parameters });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    logger.warn(`Slow query took ${time}`, {
      query,
      parameters,
    });
  }

  logSchemaBuild(message: string) {
    logger.debug(message);
  }

  logMigration(message: string) {
    logger.debug(message);
  }

  log(level: "log" | "info" | "warn", message: any) {
    switch (level) {
      case "log":
      case "info":
        logger.info(message);
        break;
      case "warn":
        logger.warn(message);
        break;
    }
  }
}
