import { randomUUID } from "crypto";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { TypeOrmConnection } from "../../db/typeorm";
import { AppKey } from "../../entity/app_key.entity";
import { EntityData } from "../../entity/entity_data.entity";
import { EntityHistory } from "../../entity/entity_history.entity";
import { EntityDataRepository } from "../../repositories/entity_data.repository";
import { EntityHistoryRepository } from "../../repositories/entity_history.repository";

type DateParams = {
  gte?: Date;
  lte?: Date;
}

export interface EntitySearchRequest {
  entity_name: string;
  params: {
    updated_at?: DateParams
    created_at?: DateParams
    ids?: string[];
  };
}

export type EntitySearchResponse = {
  entity_name: string;
  data: EntityData[];
}

export type EntityHistoryRequest = {
  entity_name: string;
  params: {
    created_at?: DateParams
  };
}

export type EntityHistoryResponse = {
  entity_name: string;
  data: EntityHistory[];
}

type EntityActionBase = {
  entity_name: string;
  payload: object;
}

type EntityActionCreate = EntityActionBase & {
  id: string;
  action: "CREATE";
}

type EntityActionUpdate = EntityActionBase & {
  action: "UPDATE";
  ids: string[];
}

type EntityActionDelete = EntityActionBase & {
  action: "DELETE";
  ids: string[];
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
    @inject(EntityDataRepository) private entityDataRepository: EntityDataRepository,
    @inject(EntityHistoryRepository) private entityHistoryRepository: EntityHistoryRepository,
  ) { }

  async searchEntitiesData(body: EntitySearchRequest[], appkey: AppKey): Promise<EntitySearchResponse[]> {
    const response = body.map(async (entityRequest): Promise<EntitySearchResponse> => {
      const where: FindOptionsWhere<EntityData> = {
        user_id: appkey.user_id,
        project_id: appkey.project_id,
        name: entityRequest.entity_name,
      };
      if (entityRequest.params.ids) {
        where.id = In(entityRequest.params.ids);
      }
      if (entityRequest.params.updated_at) {
        if (entityRequest.params.updated_at.gte) {
          where.updated_at = MoreThanOrEqual(entityRequest.params.updated_at.gte);
        } else if (entityRequest.params.updated_at.lte) {
          where.updated_at = LessThanOrEqual(entityRequest.params.updated_at.lte);
        }
      }
      if (entityRequest.params.created_at) {
        if (entityRequest.params.created_at.gte) {
          where.created_at = MoreThanOrEqual(entityRequest.params.created_at.gte);
        } else if (entityRequest.params.created_at.lte) {
          where.created_at = LessThanOrEqual(entityRequest.params.created_at.lte);
        }
      }
      const entityResponse = await this.entityDataRepository.getMany(where);
      return {
        entity_name: entityRequest.entity_name,
        data: entityResponse,
      };
    });
    return await Promise.all(response);
  }

  async searchEntitiesHistory(body: EntityHistoryRequest[], appkey: AppKey) {
    const response = body.map(async (entityRequest): Promise<EntityHistoryResponse> => {
      const where: FindOptionsWhere<EntityData> = {
        user_id: appkey.user_id,
        project_id: appkey.project_id,
        name: entityRequest.entity_name,
      };
      if (entityRequest.params.created_at) {
        if (entityRequest.params.created_at.gte) {
          where.created_at = MoreThanOrEqual(entityRequest.params.created_at.gte);
        } else if (entityRequest.params.created_at.lte) {
          where.created_at = LessThanOrEqual(entityRequest.params.created_at.lte);
        }
      }
      const entityResponse = await this.entityHistoryRepository.getMany(where);
      return {
        entity_name: entityRequest.entity_name,
        data: entityResponse,
      };
    });
    return await Promise.all(response);
  }

  async entityAction(body: EntityAction[], appkey: AppKey): Promise<EntityActionResponse[]> {
    const response = await this.conn.getInstance().transaction(async (manager) => {
      const entityDataRepository = manager.getRepository(EntityData);
      const entityHistoryRepository = manager.getRepository(EntityHistory);
      const responses: EntityActionResponse[] = [];
      for (const entityAction of body) {
        let updatedFields = 0;
        if (entityAction.action === "CREATE") {
          entityDataRepository.save({
            user_id: appkey.user_id,
            project_id: appkey.project_id,
            id: entityAction.id,
            name: entityAction.entity_name,
            content: entityAction.payload,
          });
          updatedFields = 1;
        } else if (entityAction.action === "UPDATE") {
          const updatedEntities = await entityDataRepository.update({ id: In(entityAction.ids) }, { content: entityAction.payload as object });
          if (updatedEntities.affected != null) {
            updatedFields = updatedEntities.affected;
          }
        } else if (entityAction.action === "DELETE") {
          const updatedEntities = await entityDataRepository.delete({ id: In(entityAction.ids) });
          if (updatedEntities.affected != null) {
            updatedFields = updatedEntities.affected;
          }
        }
        await entityHistoryRepository.save({
          user_id: appkey.user_id,
          project_id: appkey.project_id,
          id: entityAction.action == "CREATE" ? entityAction.id : randomUUID(),
          name: entityAction.entity_name,
          action: entityAction.action,
          payload: { ...entityAction.payload, ids: (entityAction.action === "CREATE") ? undefined : entityAction.ids, },
        });
        const response = { affectedrows: updatedFields, entity_name: entityAction.entity_name };
        responses.push(response);
      }
      return responses;
    });
    return response;
  }
}