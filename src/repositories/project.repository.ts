import { provide } from "inversify-binding-decorators";
import { BaseTypeOrmService } from "../base/BaseTypeOrmService";
import { Project } from "../entity/project.entity";

@provide(ProjectRepository)
export class ProjectRepository extends BaseTypeOrmService<Project> {
  get model() {
    return this.conn.getInstance().getRepository(Project);
  }
}
