// src/app.ts
import bodyParser from "body-parser";
import cors from "cors";
import {
  Request as ExRequest,
  Response as ExResponse,
  NextFunction,
  Router,
} from "express";
import promBundle from "express-prom-bundle";
import * as swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";

import { JsonWebTokenError } from "jsonwebtoken";
import { RegisterRoutes } from "./build/routes";
import swaggerDocument from "./build/swagger.json";
import { CustomError } from "./errors/error";
import { httpLogger, logger } from "./logger";

export const router = Router();
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: {
    collectDefaultMetrics: {},
  },
});

router.use(cors());

router.use(bodyParser.json({ limit: "100mb" }));

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use("/swagger.json", (_, res) => {
  res.send(swaggerDocument);
});

router.use(metricsMiddleware);

router.use(httpLogger);

RegisterRoutes(router);

router.use(function errorHandler(
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

export default router;