import { Request } from "express";
import { AppKey } from "../entity/app_key.entity";
import { Project } from "../entity/project.entity";
import { User } from "../entity/user.entity";

export interface UserAuthorizedRequest extends Request {
  loggedInUser: User;
}


export interface AppKeyAuthorizedRequest extends Request {
  loggedInUser: User;
  project: Project
  appkey: AppKey;
}
