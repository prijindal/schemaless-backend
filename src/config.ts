import { isEmpty, lowerCase } from "lodash";

export const PORT = Number(process.env.PORT || "3000");
export const HOST = process.env.HOST || "0.0.0.0";
export const API_KEY = process.env.API_KEY || "123456";
export const AUTO_MIGRATION = Boolean(process.env.AUTO_MIGRATION || "false");
export const LOG_LEVEL = !isEmpty(process.env.LOG_LEVEL)
  ? lowerCase(process.env.LOG_LEVEL)
  : process.env.NODE_ENV === "production"
  ? "info"
  : "debug";


type CacheImplementations =
  "no" |
  "node-cache";

export const CACHE_IMPLEMENTATION: CacheImplementations = process.env.CACHE_IMPLEMENTATION as (CacheImplementations | undefined) || "no";
export const POSTGRES_URI = process.env.POSTGRES_URI;
export const DB_PATH = process.env.DB_PATH || ":memory:";


export const REQUEST_TRACING = process.env.REQUEST_TRACING === "true";
// logFormatter: pino-pretty | json
export const LOG_FORMATTER = (process.env.LOG_FORMATTER || "JSON").toUpperCase();