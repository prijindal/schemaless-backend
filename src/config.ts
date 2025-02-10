import { isEmpty, lowerCase } from "lodash";

export const PORT = Number(process.env.PORT || "3000");
export const HOST = process.env.HOST || "0.0.0.0";
export const AUTO_MIGRATION = Boolean(process.env.AUTO_MIGRATION || "false");
export const LOG_LEVEL = !isEmpty(process.env.LOG_LEVEL)
  ? lowerCase(process.env.LOG_LEVEL)
  : process.env.NODE_ENV === "production"
    ? "info"
    : "debug";


type CacheImplementations = "redis" |
  "node-cache";

export const CACHE_IMPLEMENTATION: CacheImplementations = process.env.CACHE_IMPLEMENTATION as (CacheImplementations | undefined) || "node-cache";
export const POSTGRES_URI = process.env.POSTGRES_URI;
export const REDIS_URI = process.env.REDIS_URI || "redis://localhost:6379";


export const REQUEST_TRACING = process.env.REQUEST_TRACING === "true";
// logFormatter: pino-pretty | json
export const LOG_FORMATTER = (process.env.LOG_FORMATTER || "JSON").toUpperCase();

export const JWT_SECRET = process.env.JWT_SECRET || "1234567890";