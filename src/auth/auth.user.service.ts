import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";
import { JWT_SECRET, PROJECT_KEY } from "../config";
import { User } from "../entity/user.entity";
import { UserRepository } from "../repositories/user.repository";
import type { JwtPayload as UserJwtPayload } from "../types/jwt.types";

@provide(UserAuthService)
export class UserAuthService {
  constructor(@inject(UserRepository) private userRepository: UserRepository,
  ) { }

  async generateToken(user: User, longLived: boolean = false) {
    const options: jwt.SignOptions = {};
    if (!longLived) {
      options.expiresIn = 30 * 24 * 60 * 60;
    }
    const payload: UserJwtPayload = {
      user_id: user.id,
      token: user.token,
      type: "user",
    };
    const jwtToken = jwt.sign(payload, JWT_SECRET, options);
    return jwtToken;
  }

  /**
   * 
   * @param jwtToken Bearer token used with bearer_auth
   * @returns null if token is invalid / payload doesn't match, or user doesn't exist, or user is not activated otherwise it returns the user 
   */
  async verifyToken(jwtToken: string): Promise<User | null> {
    const payload = jwt.verify(jwtToken, JWT_SECRET) as UserJwtPayload;
    if (payload == null || payload.type != "user") {
      return null;
    }
    const user = await this.userRepository.getOne({ id: payload.user_id, token: payload.token, project_key: PROJECT_KEY });
    if (user == null || user.status != "ACTIVATED") {
      return null;
    }
    return user;
  }
}