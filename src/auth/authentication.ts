import type { Request } from "express";
import { InvalidCredentialsError } from "../errors/error";
import { extractTokenFromHeaders } from "../helpers/token";
import { iocContainer } from "../ioc";
import { logger } from "../logger";
import type { UserAuthorizedRequest } from "../types/auth.types";
import { UserAuthService } from "./auth.user.service";

export async function expressAuthentication(
  request: Request,
  securityName: "bearer_auth",
  scopes: string[]
): Promise<{ status?: string }> {
  if (securityName === "bearer_auth") {
    try {
      const userAuthService = iocContainer.get(UserAuthService);
      const token = extractTokenFromHeaders(request.headers);
      const user = await userAuthService.verifyToken(token);
      if (user == null) {
        throw new InvalidCredentialsError("Invalid jwt token");
      }
      if (scopes.indexOf("admin") >= 0 && user.is_admin == false) {
        throw new InvalidCredentialsError("Admin APIs are only accessible by admin users");
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
