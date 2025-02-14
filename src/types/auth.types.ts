import { Request } from "express";
import { Project } from "../entity/project.entity";
import { User } from "../entity/user.entity";

export interface UserAuthorizedRequest extends Request {
  loggedInUser: User;
}


export interface AppKeyAuthorizedRequest extends Request {
  loggedInUser: User;
  project: Project
}
