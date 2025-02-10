import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { AppKey } from "../entity/app_key.entity";
import { Project } from "../entity/project.entity";
import { User, UserStatus } from "../entity/user.entity";
import { AppKeyRepository } from "../repositories/app_key.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { UserRepository } from "../repositories/user.repository";
import { JwtPayload } from "../types/jwt.types";

@provide(AppKeyAuthService)
export class AppKeyAuthService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(ProjectRepository) private projectRepository: ProjectRepository,
    @inject(AppKeyRepository) private appKeyRepository: AppKeyRepository
  ) { }

  async generateToken(user: User, project: Project) {
    const token = randomUUID();
    const hashedToken = bcrypt.hashSync(token, 10);
    const appkey = await this.appKeyRepository.create({ user_id: user.id, project_id: project.id, bcrypt_hash: hashedToken });
    const payload: JwtPayload = {
      id: appkey.id,
      token: token,
    };
    const jwtToken = jwt.sign(payload, JWT_SECRET);
    return jwtToken;
  }

  /**
   * 
   * @param jwtToken Bearer token used with bearer_auth
   * @returns null if token is invalid / payload doesn't match, or user doesn't exist, otherwise it returns the user 
   */
  async verifyToken(jwtToken: string): Promise<{ user: User; project: Project; appkey: AppKey } | null> {
    const payload = jwt.verify(jwtToken, JWT_SECRET) as JwtPayload;
    const appkey = await this.appKeyRepository.getById(payload.id);
    if (appkey == null) {
      return null;
    }
    const matched = await bcrypt.compare(payload.token, appkey.bcrypt_hash);
    if (matched == false) {
      return null;
    }
    const user = await this.userRepository.getOne({ id: appkey.user_id });
    const project = await this.projectRepository.getOne({ id: appkey.project_id });
    if (user == null || user.status != UserStatus.ACTIVATED || project == null) {
      return null;
    }
    return { user: user, appkey, project: project };
  }
}