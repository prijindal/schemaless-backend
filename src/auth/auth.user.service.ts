import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { User } from "../entity/user.entity";
import { UserRepository } from "../repositories/user.repository";
import { JwtPayload as UserJwtPayload } from "../types/jwt.types";

@provide(UserAuthService)
export class UserAuthService {
  constructor(@inject(UserRepository) private userRepository: UserRepository,
  ) { }

  async generateToken(user: User) {
    const expiry_timestamp = 30 * 24 * 60 * 60; // 30 days
    const payload: UserJwtPayload = {
      user_id: user.id,
      token: user.token,
    };
    const jwtToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: expiry_timestamp,
    });
    return jwtToken;
  }

  /**
   * 
   * @param jwtToken Bearer token used with bearer_auth
   * @returns null if token is invalid / payload doesn't match, or user doesn't exist, or user is not activated otherwise it returns the user 
   */
  async verifyToken(jwtToken: string): Promise<User | null> {
    const payload = jwt.verify(jwtToken, JWT_SECRET) as UserJwtPayload;
    if (payload == null) {
      return null;
    }
    const user = await this.userRepository.getOne({ id: payload.user_id });
    if (user == null || user.status != "ACTIVATED") {
      return null;
    }
    return user;
  }
}