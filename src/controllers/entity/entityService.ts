import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { TypeOrmConnection } from "../../db/typeorm";
import { EntityHistory } from "../../entity/entity_history.entity";
import { EntityHistoryRepository } from "../../repositories/entity_history.repository";

type DateParams = {
  gte?: Date;
  lte?: Date;
}

enum EntityHistoryRequestOrderEnum { "asc" = "asc", "desc" = "desc" };

export type EntityHistoryRequest = {
  entity_name: string;
  params: {
    created_at?: DateParams
    host_id?: {
      ne?: string;
    }
  };
  order: Record<string, EntityHistoryRequestOrderEnum>;
}

export type EntityHistoryResponse = {
  entity_name: string;
  data: EntityHistory[];
}

type EntityActionBase = {
  entity_name: string;
  timestamp: Date;
  request_id: string;
  entity_id: string;
  host_id: string;
}

type EntityActionCreate = EntityActionBase & {
  action: "CREATE";
  payload: object;
}

type EntityActionUpdate = EntityActionBase & {
  action: "UPDATE";
  payload: object;
}

type EntityActionDelete = EntityActionBase & {
  action: "DELETE";
}

export type EntityAction = EntityActionCreate | EntityActionUpdate | EntityActionDelete;

export type EntityActionResponse = {
  entity_name: string;
  affectedrows: number;
}

@provide(EntityActionService)
export class EntityActionService {
  constructor(
    @inject(TypeOrmConnection) protected conn: TypeOrmConnection,
    @inject(EntityHistoryRepository) private entityHistoryRepository: EntityHistoryRepository,
  ) { }

  async getEntities(project_id: string) {
    return this.entityHistoryRepository.distinct({project_id: project_id}, "entity_name") as Promise<string[]>;
  }

  async searchEntitiesHistory(body: EntityHistoryRequest[], project_id: string) {
    const response = body.map(async (entityRequest): Promise<EntityHistoryResponse> => {
      const where: FindOptionsWhere<EntityHistory> = {
        project_id: project_id,
        entity_name: entityRequest.entity_name,
      };
      if (entityRequest.params.created_at) {
        if (entityRequest.params.created_at.gte) {
          where.created_at = MoreThanOrEqual(entityRequest.params.created_at.gte);
        } else if (entityRequest.params.created_at.lte) {
          where.created_at = LessThanOrEqual(entityRequest.params.created_at.lte);
        }
      }
      if (entityRequest.params.host_id) {
        if (entityRequest.params.host_id.ne) {
          where.host_id = Not(entityRequest.params.host_id.ne);
        }
      }
      const entityResponse = await this.entityHistoryRepository.getMany(where, { order: entityRequest.order });
      return {
        entity_name: entityRequest.entity_name,
        data: entityResponse,
      };
    });
    return await Promise.all(response);
  }

  async entityAction(body: EntityAction[], project_id: string): Promise<EntityActionResponse[]> {
    const response = await this.conn.getInstance().transaction(async (manager) => {
      const entityHistoryRepository = manager.getRepository(EntityHistory);
      const responses: EntityActionResponse[] = [];
      for (const entityAction of body) {
        await entityHistoryRepository.save({
          project_id: project_id,
          id: entityAction.request_id,
          entity_name: entityAction.entity_name,
          entity_id: entityAction.entity_id,
          host_id: entityAction.host_id,
          action: entityAction.action,
          payload: entityAction.action === "DELETE" ? {} : entityAction.payload,
          timestamp: entityAction.timestamp,
        });
        const response = { affectedrows: 1, entity_name: entityAction.entity_name };
        responses.push(response);
      }
      return responses;
    });
    return response;
  }
}