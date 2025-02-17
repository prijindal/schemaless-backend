import type { LoggerOptions } from "typeorm";
import type { BaseDataSourceOptions } from "typeorm/data-source/BaseDataSourceOptions.js";
import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";

import { PinoTypeormLogger } from "./typeorm_logger";

import { AUTO_MIGRATION, LOG_LEVEL, POSTGRES_URI } from "../config";
import { EntityHistory } from "../entity/entity_history.entity";
import { User } from "../entity/user.entity";

const logLevelMap: { [k: string]: LoggerOptions } = {
  info: ["error", "migration", "schema", "warn"],
  debug: "all",
};

const typeOrmLogging: LoggerOptions = logLevelMap[LOG_LEVEL] || [
  "error",
  "migration",
  "schema",
  "warn",
];

export const baseDbOptions: Omit<BaseDataSourceOptions, "type"> = {
  entities: [
    User,
    EntityHistory,
  ],
  synchronize: AUTO_MIGRATION,
  logging: typeOrmLogging,
  logger: new PinoTypeormLogger(),
  extra: {
    connectionLimit: 5,
  },
};

const createOptions = () => {
  return {
    ...baseDbOptions,
    type: "postgres",
    url: POSTGRES_URI,
  } as PostgresConnectionOptions;
};

export const options = createOptions();
