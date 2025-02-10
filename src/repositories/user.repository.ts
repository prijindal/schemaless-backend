import { provide } from "inversify-binding-decorators";
import { BaseTypeOrmService } from "../base/BaseTypeOrmService";
import { User } from "../entity/user.entity";

@provide(UserRepository)
export class UserRepository extends BaseTypeOrmService<User> {
  get model() {
    return this.conn.getInstance().getRepository(User);
  }
}
