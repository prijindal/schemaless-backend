import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Delete, Get, Path, Post, Query, Request, Route, Security, Tags } from "tsoa";
import { AppKeyAuthService } from "../../auth/appkey.user.service";
import { AppKey } from "../../entity/app_key.entity";
import { NotExistsError } from "../../errors/error";
import { AppKeyRepository } from "../../repositories/app_key.repository";
import { ProjectRepository } from "../../repositories/project.repository";
import { UserAuthorizedRequest } from "../../types/auth.types";

interface CreateAppKeyRequest extends Pick<AppKey, "project_id"> { }

@Tags("appkeys")
@Route("/appkeys")
@Security("bearer_auth")
@provide(AppKeyController)
export class AppKeyController {
  constructor(
    @inject(AppKeyRepository) private appKeyRepository: AppKeyRepository,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(AppKeyAuthService) private appKeyAuthService: AppKeyAuthService,
  ) { }

  @Get("")
  async listAppKeys(@Request() request: UserAuthorizedRequest, @Query("projectid") projectid?: string,) {
    const appkeys = await this.appKeyRepository.getMany({ user_id: request.loggedInUser.id, project_id: projectid });
    return appkeys.map((appkey) => ({
      id: appkey.id,
      user_id: appkey.user_id,
      project_id: appkey.project_id,
      created_at: appkey.created_at,
    }));
  }

  /**
   * 
   * @param body project_id against which the appkey is generated
   * @param request 
   * @returns jwtToken to be used for this project
   */
  @Post("")
  async generateAppKey(@Body() body: CreateAppKeyRequest, @Request() request: UserAuthorizedRequest) {
    const project = await this.projectRepository.getOne({ id: body.project_id, user_id: request.loggedInUser.id });
    if (project == null) {
      throw new NotExistsError("Project not found");
    }
    const appKey = await this.appKeyAuthService.generateToken(request.loggedInUser, project);
    return appKey;
  }

  @Delete(":appkeyid")
  async deleteAppKey(@Path("appkeyid") appkeyid: string, @Request() request: UserAuthorizedRequest) {
    const appKey = await this.appKeyRepository.getOne({ id: appkeyid, user_id: request.loggedInUser.id });
    if (appKey == null) {
      throw new NotExistsError("Project not found");
    }
    await this.appKeyRepository.delete(appkeyid);
    return appKey;
  }
}
