import { provide } from "inversify-binding-decorators";
import { Post, Request, Route, Security, Tags } from "tsoa";
import { User } from "../../entity/user.entity";
import { AppKeyAuthorizedRequest, UserAuthorizedRequest } from "../../types/auth.types";

type UserVerifyResponse = Pick<User, "username" | "created_at" | "status" | "is_admin">;
type AppKeyVerifyResponse = {
  id: string;
  project_name: string;
}

@Tags("auth")
@Route("/auth")
@provide(AuthVerifyController)
export class AuthVerifyController {
  constructor(
  ) { }

  @Post("/appkey")
  @Security("bearer_appkey")
  async verifyAppKey(@Request() request: AppKeyAuthorizedRequest): Promise<AppKeyVerifyResponse> {
    const project = request.project;
    const appkey = request.appkey;
    return {
      id: appkey.id,
      project_name: project.name,
    };
  }

  @Post("/user")
  @Security("bearer_auth")
  async verifyUserAuth(@Request() request: UserAuthorizedRequest): Promise<UserVerifyResponse> {
    const user = request.loggedInUser;
    return {
      username: user.username,
      created_at: user.created_at,
      status: user.status,
      is_admin: user.is_admin,
    }
  }
}
