import { randomUUID } from "crypto";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Get, Post, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import { UserAuthService } from "../../auth/auth.user.service";
import { User } from "../../entity/user.entity";
import { NotExistsError } from "../../errors/error";
import { UserRepository } from "../../repositories/user.repository";
import type { UserAuthorizedRequest } from "../../types/auth.types";

interface UserVerifyResponse extends Pick<User, "username" | "created_at" | "status" | "is_admin"> { };

@Tags("auth")
@Route("/auth")
@Security("bearer_auth")
@provide(AuthVerifyController)
export class AuthVerifyController {
  constructor(
    @inject(UserAuthService) private userAuthService: UserAuthService,
    @inject(UserRepository) private userRepository: UserRepository,
  ) { }

  @Get("/user")
  async verifyUserAuth(@Request() request: UserAuthorizedRequest): Promise<UserVerifyResponse> {
    const user = request.loggedInUser;
    return {
      username: user.username,
      created_at: user.created_at,
      status: user.status,
      is_admin: user.is_admin,
    }
  }

  @Post("generatekey")
  @SuccessResponse(200)
  async generateKey(@Request() request: UserAuthorizedRequest) {
    const token = await this.userAuthService.generateToken(request.loggedInUser, true);
    return token;
  }

  @Post("revokekeys")
  @Response<NotExistsError>(NotExistsError.status_code)
  @SuccessResponse(200)
  async revokeKeys(@Request() request: UserAuthorizedRequest) {
    await this.userRepository.update({ id: request.loggedInUser.id }, { token: randomUUID() });
    const updatedUser = await this.userRepository.getOne({ id: request.loggedInUser.id, });
    if (updatedUser == null) {
      throw new NotExistsError("User not found");
    }
    return updatedUser;
  }
}
