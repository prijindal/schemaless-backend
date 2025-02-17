import type { IncomingHttpHeaders } from "http";
import { InvalidCredentialsError } from "../errors/error";


export function extractTokenFromHeaders(headers: IncomingHttpHeaders) {
  const authorization = headers.authorization;
  if (authorization == null || !authorization.startsWith("Bearer ")) {
    throw new InvalidCredentialsError("Token invalid");
  }
  const jwtToken = authorization.split("Bearer ")[1];
  return jwtToken;
}
