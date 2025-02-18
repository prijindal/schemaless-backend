import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { type FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { PROJECT_KEY } from "../../config";
import { TypeOrmConnection } from "../../db/typeorm";
import { EntityHistory as EntityHistoryEntity } from "../../entity/entity_history.entity";
import { EntityHistoryRepository } from "../../repositories/entity_history.repository";

interface EntityHistory extends Pick<EntityHistoryEntity, "action" | "created_at" | "entity_id" | "entity_name" | "id" | "payload" | "timestamp"> { };

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

  async getEntities(user_id: string) {
    return this.entityHistoryRepository.distinct({ user_id: user_id, project_key: PROJECT_KEY }, "entity_name") as Promise<string[]>;
  }

  async searchEntitiesHistory(body: EntityHistoryRequest[], user_id: string) {
    const response = body.map(async (entityRequest): Promise<EntityHistoryResponse> => {
      const where: FindOptionsWhere<EntityHistoryEntity> = {
        user_id: user_id,
        entity_name: entityRequest.entity_name,
        project_key: PROJECT_KEY
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
        data: entityResponse.map((a) => ({
          action: a.action,
          created_at: a.created_at,
          entity_id: a.entity_id,
          entity_name: a.entity_name,
          id: a.id,
          payload: a.payload,
          timestamp: a.timestamp
        })),
      };
    });
    return await Promise.all(response);
  }

  async entityAction(body: EntityAction[], user_id: string): Promise<EntityActionResponse[]> {
    const response = await this.conn.getInstance().transaction(async (manager) => {
      const entityHistoryRepository = manager.getRepository(EntityHistoryEntity);
      const responses: EntityActionResponse[] = [];
      for (const entityAction of body) {
        await entityHistoryRepository.save({
          user_id: user_id,
          id: entityAction.request_id,
          entity_name: entityAction.entity_name,
          entity_id: entityAction.entity_id,
          host_id: entityAction.host_id,
          action: entityAction.action,
          payload: entityAction.action === "DELETE" ? {} : entityAction.payload,
          timestamp: entityAction.timestamp,
          project_key: PROJECT_KEY
        });
        const response = { affectedrows: 1, entity_name: entityAction.entity_name };
        responses.push(response);
      }
      return responses;
    });
    return response;
  }
}