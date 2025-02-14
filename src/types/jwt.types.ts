export type JwtPayload = {
  type: "user";
  user_id: string;
  token: string;
}