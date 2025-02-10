import { provide } from "inversify-binding-decorators";
import { BaseTypeOrmService } from "../base/BaseTypeOrmService";
import { AppKey } from "../entity/app_key.entity";

@provide(AppKeyRepository)
export class AppKeyRepository extends BaseTypeOrmService<AppKey> {
  get model() {
    return this.conn.getInstance().getRepository(AppKey);
  }
}
