import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import jwt from "jsonwebtoken";
import { CacheService } from "../cache";
import { JWT_SECRET } from "../config";
import { User } from "../entity/user.entity";
import { UserRepository } from "../repositories/user.repository";
import { JwtPayload } from "../types/jwt.types";

type TokenPayload = {
  user_id: string;
  bcrypt_hash: string;
}

@provide(UserAuthService)
export class UserAuthService {
  constructor(@inject(UserRepository) private userRepository: UserRepository,
    @inject(CacheService) private cacheService: CacheService,
  ) { }

  async generateToken(user: User) {
    const id = randomUUID();
    const token = randomUUID();
    const hashedToken = bcrypt.hashSync(token, 10);
    const savedPayload: TokenPayload = {
      user_id: user.id,
      bcrypt_hash: hashedToken,
    }
    const expiry_timestamp = 30 * 24 * 60 * 60; // 30 days
    const key = `user_token_${id}`;
    await this.cacheService.set<TokenPayload>(key, savedPayload, expiry_timestamp);
    const payload: JwtPayload = {
      id: id,
      token: token,
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
    const payload = jwt.verify(jwtToken, JWT_SECRET) as JwtPayload;
    const key = `user_token_${payload.id}`;
    const savedPayload = await this.cacheService.get<TokenPayload>(key);
    if (savedPayload == null) {
      return null;
    }
    const matched = await bcrypt.compare(payload.token, savedPayload.bcrypt_hash);
    if (matched == false) {
      return null;
    }
    const user = await this.userRepository.getOne({ id: savedPayload.user_id });
    if (user == null || user.status != "ACTIVATED") {
      return null;
    }
    return user;
  }
}