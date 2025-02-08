import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { API_KEY } from "../config";
import { logger } from "../logger";

function extractTokenFromHeaders(headers: IncomingHttpHeaders) {
  const authorization = headers.authorization;
  if (authorization == null || !authorization.startsWith("Bearer ")) {
    throw new Error("Token invalid");
  }
  const jwtToken = authorization.split("Bearer ")[1];
  return jwtToken;
}

export async function expressAuthentication(
  request: Request,
  securityName: "api_key" | "bearer_centralized" | "bearer_auth",
): Promise<{ status?: string }> {
  if (securityName === "api_key") {
    const apiKey = request.headers["x-api-key"];
    if (apiKey && typeof apiKey === "string" && apiKey === API_KEY) {
      return Promise.resolve({});
    } else {
      return Promise.reject({ status: "No api token found" });
    }
  } else if (securityName === "bearer_centralized") {
    try {
      return Promise.resolve({});
    } catch (e) {
      logger.error(e);
      return Promise.reject({});
    }
  } else if (securityName === "bearer_auth") {
    try {
      const token = extractTokenFromHeaders(request.headers);
      if (token != null) {
        return Promise.resolve({});
      } else {
        return Promise.reject({});
      }
    } catch (e) {
      logger.error(e);
      return Promise.reject({});
    }
  }
  return Promise.resolve({});
}
