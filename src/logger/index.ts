import { randomUUID } from "crypto";
// import { NextFunction, Request, Response } from "express";
import pino from "pino";
import pinoCaller from "pino-caller";
import PinoHttp from "pino-http";
// import { SecureRequest } from "../types/auth_user";
import { IncomingMessage } from "http";
import { LOG_FORMATTER, LOG_LEVEL, REQUEST_TRACING } from "../config";
import { context } from "./async-context";

// Create a logging instance
const pinoOptions: pino.LoggerOptions = {
  level: LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label }),
  },
};


if (LOG_FORMATTER === "PINO-PRETTY") {
  pinoOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

export let pinoLogger = pino(pinoOptions);
if (LOG_LEVEL === "debug") {
  pinoLogger = pinoCaller(pinoLogger);
}

// Proxify logger instance to use child logger from context if it exists
export const logger = new Proxy(pinoLogger, {
  get(target, property, receiver) {
    const store = context.getStore();
    target = store?.get("logger") || target;
    return Reflect.get(target, property, receiver);
  },
});

const createLoggerObject = (req: IncomingMessage) => {
  const loggerObj: { [k: string]: string | string[] | undefined } = {};
  if (REQUEST_TRACING) {
    loggerObj.requestId = req.headers["x-request-id"] || randomUUID();
    loggerObj.method = req.method;
    loggerObj.url = req.url;
  }
  // if ((req as SecureRequest).loggedInUser) {
  //   loggerObj.userId = (req as SecureRequest).loggedInUser.user.id;
  //   loggerObj.accountId = (req as SecureRequest).loggedInUser.account.id;
  // }
  return loggerObj;
};

export const httpLogger = PinoHttp({
  logger,
  useLevel: "debug",
  customProps: (req) => createLoggerObject(req),
});

// Generate a unique ID for each incoming request and store a child logger in context
// to always log the request ID
// export const contextMiddleware = (req: Request, __: Response, next: NextFunction) => {
//   const loggerObj = createLoggerObject(req);
//   const child = pinoLogger.child(loggerObj);
//   const store = new Map();
//   store.set("logger", child);

//   return (context as any).run(store, next);
// };
