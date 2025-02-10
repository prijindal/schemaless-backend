import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { InvalidCredentialsError } from "../errors/error";
import { iocContainer } from "../ioc";
import { logger } from "../logger";
import { AppKeyAuthorizedRequest, UserAuthorizedRequest } from "../types/auth.types";
import { AppKeyAuthService } from "./appkey.user.service";
import { UserAuthService } from "./auth.user.service";

function extractTokenFromHeaders(headers: IncomingHttpHeaders) {
  const authorization = headers.authorization;
  if (authorization == null || !authorization.startsWith("Bearer ")) {
    throw new InvalidCredentialsError("Token invalid");
  }
  const jwtToken = authorization.split("Bearer ")[1];
  return jwtToken;
}

export async function expressAuthentication(
  request: Request,
  securityName: "bearer_appkey" | "bearer_auth",
): Promise<{ status?: string }> {
  if (securityName === "bearer_appkey") {
    try {
      const appKeyAuthService = iocContainer.get(AppKeyAuthService);
      const token = extractTokenFromHeaders(request.headers);
      const appkeyPayload = await appKeyAuthService.verifyToken(token);
      if (appkeyPayload == null) {
        throw new InvalidCredentialsError("Invalid jwt token");
      }
      (request as AppKeyAuthorizedRequest).loggedInUser = appkeyPayload.user;
      (request as AppKeyAuthorizedRequest).project = appkeyPayload.project;
      (request as AppKeyAuthorizedRequest).appkey = appkeyPayload.appkey;
      return Promise.resolve({});
    } catch (e) {
      logger.error(e);
      return Promise.reject({});
    }
  } else if (securityName === "bearer_auth") {
    try {
      const userAuthService = iocContainer.get(UserAuthService);
      const token = extractTokenFromHeaders(request.headers);
      const user = await userAuthService.verifyToken(token);
      if (user == null) {
        throw new InvalidCredentialsError("Invalid jwt token");
      }
      (request as UserAuthorizedRequest).loggedInUser = user;
      return Promise.resolve({});
    } catch (e) {
      logger.error(e);
      return Promise.reject({});
    }
  }
  return Promise.reject({});
}
