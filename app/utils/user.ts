import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const jwtCookie = createCookie("userJwtToken", {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  secrets: ["s3cret1"],
});

export async function extractJwtToken(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await jwtCookie.parse(cookieHeader));

  if (cookie == null || cookie.jwtToken == null) {
    return null;
  }
  return cookie.jwtToken;
}

export async function setUser(request: Request, jwtToken: string): Promise<string> {
  const cookieHeader = request.headers.get("Cookie");
  const cookie =
    (await jwtCookie.parse(cookieHeader)) || {};

  cookie.jwtToken = jwtToken;

  return jwtCookie.serialize(cookie);

}