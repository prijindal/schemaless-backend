import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Delete, Get, Path, Post, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import { UserStatus } from "../../entity/user.entity";
import { NotExistsError } from "../../errors/error";
import { UserRepository } from "../../repositories/user.repository";

@Tags("admin")
@Route("/user/admin")
@Security("bearer_auth", ["admin"])
@provide(UserAdminController)
export class UserAdminController {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository
  ) { }

  @Post("/:userid/approval")
  @Response<NotExistsError>(NotExistsError.status_code)
  @SuccessResponse(200)
  async userApproval(@Path("userid") userid: string, @Body() body: { approval: boolean }) {
    const user = await this.userRepository.getOne({ id: userid });
    if (user == null) {
      throw new NotExistsError("User does not exist");
    }
    await this.userRepository.update({ id: userid }, { status: body.approval ? UserStatus.ACTIVATED : UserStatus.DEACTIVATED });
    // Deactivate this user
    return true;
  }

  @Delete("/:userid")
  @Response<NotExistsError>(NotExistsError.status_code)
  @SuccessResponse(200)
  async deleteUser(@Path() userid: string) {
    const user = await this.userRepository.getOne({ id: userid });
    if (user == null) {
      throw new NotExistsError("User does not exist");
    }
    await this.userRepository.delete(userid);
    return true;
  }

  @Get("")
  async listUsers() {
    const users = await this.userRepository.getMany({});
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      status: user.status,
      is_admin: user.is_admin,
    }));
  }
}
