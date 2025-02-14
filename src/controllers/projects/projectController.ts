import { randomUUID } from "crypto";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Delete, Get, Path, Post, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import { AppKeyAuthService } from "../../auth/appkey.user.service";
import { Project } from "../../entity/project.entity";
import { AlreadyExistsError, NotExistsError } from "../../errors/error";
import { ProjectRepository } from "../../repositories/project.repository";
import { UserAuthorizedRequest } from "../../types/auth.types";

interface CreateProjectRequest extends Pick<Project, "name"> { }
interface EditProjectRequest extends Pick<Project, "name"> { }

@Tags("project")
@Route("/projects")
@Security("bearer_auth")
@provide(ProjectController)
export class ProjectController {
  constructor(
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(AppKeyAuthService) private appKeyAuthService: AppKeyAuthService,
  ) { }

  @Get("")
  async listProjects(@Request() request: UserAuthorizedRequest): Promise<Project[]> {
    const projects = await this.projectRepository.getMany({ user_id: request.loggedInUser.id });
    return projects;
  }

  @Post("")
  @Response<AlreadyExistsError>(AlreadyExistsError.status_code)
  @SuccessResponse(200)
  async createProjects(@Body() body: CreateProjectRequest, @Request() request: UserAuthorizedRequest): Promise<Project> {
    const exisingProject = await this.projectRepository.getOne({ name: body.name, user_id: request.loggedInUser.id });
    if (exisingProject != null) {
      throw new AlreadyExistsError("Project already exists");
    }
    const newProject = await this.projectRepository.create({
      name: body.name,
      user_id: request.loggedInUser.id,
      token: randomUUID(),
    });
    return newProject;
  }

  @Post(":projectid/generatekey")
  @Response<NotExistsError>(NotExistsError.status_code)
  @SuccessResponse(200)
  async generateKey(@Path("projectid") projectid: string, @Request() request: UserAuthorizedRequest) {
    const project = await this.projectRepository.getOne({ id: projectid, user_id: request.loggedInUser.id });
    if (project == null) {
      throw new NotExistsError("Project not found");
    }
    const token = await this.appKeyAuthService.generateToken(project);
    return token;
  }

  @Post(":projectid/revokekeys")
  @Response<NotExistsError>(NotExistsError.status_code)
  @SuccessResponse(200)
  async revokeKeys(@Path("projectid") projectid: string, @Request() request: UserAuthorizedRequest) {
    const project = await this.projectRepository.getOne({ id: projectid, user_id: request.loggedInUser.id });
    if (project == null) {
      throw new NotExistsError("Project not found");
    }
    await this.projectRepository.update({ id: projectid }, { token: randomUUID() });
    const updatedproject = await this.projectRepository.getOne({ id: projectid, user_id: request.loggedInUser.id });
    if (updatedproject == null) {
      throw new NotExistsError("Project not found");
    }
    return updatedproject;
  }

  @Post(":projectid")
  @Response<NotExistsError>(NotExistsError.status_code)
  @SuccessResponse(200)
  async editProject(@Path("projectid") projectid: string, @Body() body: EditProjectRequest, @Request() request: UserAuthorizedRequest): Promise<Project> {
    const project = await this.projectRepository.getOne({ id: projectid, user_id: request.loggedInUser.id });
    if (project == null) {
      throw new NotExistsError("Project not found");
    }
    const exisingProject = await this.projectRepository.getOne({ name: body.name, user_id: request.loggedInUser.id });
    if (exisingProject != null) {
      throw new AlreadyExistsError("Project already exists");
    }
    await this.projectRepository.update({ id: projectid }, { name: body.name });
    const updatedproject = await this.projectRepository.getOne({ id: projectid, user_id: request.loggedInUser.id });
    if (updatedproject == null) {
      throw new NotExistsError("Project not found");
    }
    return updatedproject;
  }

  @Delete(":projectid")
  @Response<NotExistsError>(NotExistsError.status_code)
  @SuccessResponse(200)
  async deleteProject(@Path("projectid") projectid: string, @Request() request: UserAuthorizedRequest): Promise<Project> {
    const project = await this.projectRepository.getOne({ id: projectid, user_id: request.loggedInUser.id });
    if (project == null) {
      throw new NotExistsError("Project not found");
    }
    await this.projectRepository.delete(projectid);
    return project;
  }
}
