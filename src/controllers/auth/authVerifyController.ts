import { provide } from "inversify-binding-decorators";
import { Get, Request, Route, Security, Tags } from "tsoa";
import { User } from "../../entity/user.entity";
import { AppKeyAuthorizedRequest, UserAuthorizedRequest } from "../../types/auth.types";

interface UserVerifyResponse extends Pick<User, "username" | "created_at" | "status" | "is_admin"> { };
interface AppKeyVerifyResponse {
  project_id: string;
  project_name: string;
}

@Tags("auth")
@Route("/auth")
@provide(AuthVerifyController)
export class AuthVerifyController {
  constructor(
  ) { }

  @Get("/appkey")
  @Security("bearer_appkey")
  async verifyAppKey(@Request() request: AppKeyAuthorizedRequest): Promise<AppKeyVerifyResponse> {
    const project = request.project;
    return {
      project_id: project.id,
      project_name: project.name,
    };
  }

  @Get("/user")
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
