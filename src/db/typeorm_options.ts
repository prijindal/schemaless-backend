import { LoggerOptions } from "typeorm";
import { BaseDataSourceOptions } from "typeorm/data-source/BaseDataSourceOptions";
import { BetterSqlite3ConnectionOptions } from "typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import { PinoTypeormLogger } from "./typeorm_logger";

import { AUTO_MIGRATION, DB_PATH, LOG_LEVEL, POSTGRES_URI } from "../config";

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
  ],
  synchronize: AUTO_MIGRATION,
  logging: typeOrmLogging,
  logger: new PinoTypeormLogger(),
  extra: {
    connectionLimit: 5,
  },
};

const createOptions = () => {
  if (POSTGRES_URI) {
    return {
      ...baseDbOptions,
      type: "postgres",
      url: POSTGRES_URI,
    } as PostgresConnectionOptions;
  } else {
    return {
      ...baseDbOptions,
      type: "better-sqlite3",
      database: DB_PATH,
    } as BetterSqlite3ConnectionOptions;
  }
};

export const options = createOptions();
