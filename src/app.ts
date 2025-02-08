// src/app.ts
import bodyParser from "body-parser";
import cors from "cors";
import express, {
  Request as ExRequest,
  Response as ExResponse,
  NextFunction,
} from "express";
import promBundle from "express-prom-bundle";
import * as swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";

import { JsonWebTokenError } from "jsonwebtoken";
import { RegisterRoutes } from "./build/routes";
import swaggerDocument from "./build/swagger.json";
import { TypeOrmConnection } from "./db/typeorm";
import { CustomError } from "./errors/error";
import { iocContainer } from "./ioc";
import { httpLogger, logger } from "./logger";

export const app = express();
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: {
    collectDefaultMetrics: {},
  },
});

app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/swagger.json", (_, res) => {
  res.send(swaggerDocument);
});

app.use(metricsMiddleware);

app.use(httpLogger);

RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): void {
  if (err instanceof SyntaxError) {
    logger.error(
      `Caught Syntax Error for ${req.path}:${JSON.stringify(err.message)}`
    );
    res.status(422).json({
      message: "Syntax Error",
      details: err?.message,
    });
    return;
  }
  if (err instanceof ValidateError) {
    logger.error(
      `Caught Validation Error for ${req.path}:${JSON.stringify(err.fields)}`
    );
    res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
    return;
  } else if (err instanceof JsonWebTokenError) {
    logger.error(`Caught ${err.name} for ${req.path}:${err.message}`);
    res.status(422).json({
      message: err.name,
      details: err?.message,
    });
    return;
  } else if (err instanceof CustomError) {
    logger.error(err);
    res.status(err.status_code).json({ ...err, details: undefined });
    return;
  } else if (err instanceof Error) {
    logger.error(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
    return;
  }

  next();
});

export const shutdown = async () => {
  const db = iocContainer.get(TypeOrmConnection).getInstance();
  try {
    await db?.destroy();
  } catch (err) {
    logger.error(err);
  }
};

