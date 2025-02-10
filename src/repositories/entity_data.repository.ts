import { provide } from "inversify-binding-decorators";
import { BaseTypeOrmService } from "../base/BaseTypeOrmService";
import { EntityData } from "../entity/entity_data.entity";

@provide(EntityDataRepository)
export class EntityDataRepository extends BaseTypeOrmService<EntityData> {
  get model() {
    return this.conn.getInstance().getRepository(EntityData);
  }
}
