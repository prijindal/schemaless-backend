import { Request } from "express";
import { User } from "../entity/user.entity";

export interface UserAuthorizedRequest extends Request {
  loggedInUser: User;
}

