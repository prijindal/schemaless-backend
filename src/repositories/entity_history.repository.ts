import { provide } from "inversify-binding-decorators";
import { BaseTypeOrmService } from "../base/BaseTypeOrmService";
import { EntityHistory } from "../entity/entity_history.entity";

@provide(EntityHistoryRepository)
export class EntityHistoryRepository extends BaseTypeOrmService<EntityHistory> {
  get model() {
    return this.conn.getInstance().getRepository(EntityHistory);
  }
}
