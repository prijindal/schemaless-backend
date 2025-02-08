import { BetterSqlite3ConnectionOptions } from "typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions.js";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { TypeOrmConnection } from "./db/typeorm";
import { logger } from "./logger";

import { options } from "./db/typeorm_options";
import { iocContainer } from "./ioc";

export async function setup(
  dbOptions:
    | PostgresConnectionOptions
    | BetterSqlite3ConnectionOptions = options
) {
  try {
    await Promise.all([iocContainer.get(TypeOrmConnection).connect(dbOptions)]);
  } catch (e) {
    logger.error(e);
    throw e;
  }
}
