import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Delete, Get, Path, Post, Request, Route, Security, Tags } from "tsoa";
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
  ) { }

  @Get("")
  async listProjects(@Request() request: UserAuthorizedRequest): Promise<Project[]> {
    const projects = await this.projectRepository.getMany({ user_id: request.loggedInUser.id });
    return projects;
  }

  @Post("")
  async createProjects(@Body() body: CreateProjectRequest, @Request() request: UserAuthorizedRequest): Promise<Project> {
    const exisingProject = await this.projectRepository.getOne({ name: body.name, user_id: request.loggedInUser.id });
    if (exisingProject != null) {
      throw new AlreadyExistsError("Project already exists");
    }
    const newProject = await this.projectRepository.create({
      name: body.name,
      user_id: request.loggedInUser.id,
    });
    return newProject;
  }

  @Post(":projectid")
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
  async deleteProject(@Path("projectid") projectid: string, @Request() request: UserAuthorizedRequest): Promise<Project> {
    const project = await this.projectRepository.getOne({ id: projectid, user_id: request.loggedInUser.id });
    if (project == null) {
      throw new NotExistsError("Project not found");
    }
    await this.projectRepository.delete(projectid);
    return project;
  }
}
