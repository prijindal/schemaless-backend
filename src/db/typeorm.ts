import { DataSource } from "typeorm";
import type { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { Retrier } from "../helpers/retrier";
import { logger } from "../logger";
import { singleton } from "../singleton";
import { options } from "./typeorm_options";

@singleton(TypeOrmConnection)
export class TypeOrmConnection {
  private _conn: DataSource;
  private _retrier = new Retrier({ limit: 10, delay: 10 * 1000 });

  constructor() {
    this._conn = new DataSource({ ...options });
  }

  connect = async (
    dbOptions: PostgresConnectionOptions
  ) => {
    try {
      this._conn = new DataSource({ ...dbOptions });
      this._conn = await this._retrier.resolve(() => this._conn.initialize());
      logger.info("Database connected");
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };


  getInstance() {
    return this._conn;
  }
}
