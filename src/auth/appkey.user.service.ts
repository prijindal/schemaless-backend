import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Project } from "../entity/project.entity";
import { User, UserStatus } from "../entity/user.entity";
import { ProjectRepository } from "../repositories/project.repository";
import { UserRepository } from "../repositories/user.repository";
import { ProjectJwtPayload } from "../types/jwt.types";

@provide(AppKeyAuthService)
export class AppKeyAuthService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
  ) { }

  async generateToken(project: Project) {
    const payload:ProjectJwtPayload = {
      project_id: project.id,
      token: project.token,
    }
    const jwtToken = jwt.sign(payload, JWT_SECRET);
    return jwtToken;
  }

  /**
   * 
   * @param jwtToken Bearer token used with bearer_auth
   * @returns null if token is invalid / payload doesn't match, or user doesn't exist, otherwise it returns the user 
   */
  async verifyToken(jwtToken: string): Promise<{ user: User; project: Project } | null> {
    const payload = jwt.verify(jwtToken, JWT_SECRET) as ProjectJwtPayload;
    if (payload == null) {
      return null;
    }
    const project = await this.projectRepository.getOne({ id: payload.project_id });
    if(project == null) {
      return null;
    }
    const user = await this.userRepository.getOne({ id: project.user_id });
    if (user == null || user.status != UserStatus.ACTIVATED) {
      return null;
    }
    return { user: user, project: project };
  }
}