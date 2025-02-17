import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { TypeOrmConnection } from "./db/typeorm";
import { logger } from "./logger";

import { options } from "./db/typeorm_options";
import { iocContainer } from "./ioc";

export async function setup(
  dbOptions:
    PostgresConnectionOptions = options
) {
  try {
    await Promise.all([iocContainer.get(TypeOrmConnection).connect(dbOptions)]);
  } catch (e) {
    logger.error(e);
    throw e;
  }
}
