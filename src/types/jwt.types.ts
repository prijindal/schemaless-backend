export type JwtPayload = {
  type: "user";
  user_id: string;
  token: string;
}

export type ProjectJwtPayload = {
  type: "project";
  project_id: string;
  token: string;
}