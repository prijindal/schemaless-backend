import dayjs from "dayjs";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
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

enum EntityHistoryRequestOrderEnum { "asc", "desc" };
enum EntitySearchRequestOrderEnum { "asc", "desc" };

export interface EntitySearchRequest {
  entity_name: string;
  params: {
    updated_at?: DateParams
    created_at?: DateParams
    ids?: string[];
  };
  order: Record<string, EntitySearchRequestOrderEnum>;
}

export type EntitySearchResponse = {
  entity_name: string;
  data: EntityData[];
}

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
      const entityResponse = await this.entityDataRepository.getMany(where, { order: entityRequest.order });
      return {
        entity_name: entityRequest.entity_name,
        data: entityResponse,
      };
    });
    return await Promise.all(response);
  }

  async searchEntitiesHistory(body: EntityHistoryRequest[], appkey: AppKey) {
    const response = body.map(async (entityRequest): Promise<EntityHistoryResponse> => {
      const where: FindOptionsWhere<EntityHistory> = {
        user_id: appkey.user_id,
        project_id: appkey.project_id,
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
            id: entityAction.entity_id,
            name: entityAction.entity_name,
            content: entityAction.payload,
            updated_at: entityAction.timestamp,
            created_at: entityAction.timestamp,
          });
          updatedFields = 1;
        } else if (entityAction.action === "UPDATE") {
          // Only update if timestamp is greater than the updated_at time of the entry for thid id in db
          const existingEntity = await entityDataRepository.findOne({ where: { id: entityAction.entity_id } });
          if (existingEntity != null) {
            console.log(dayjs(existingEntity.updated_at) < dayjs(entityAction.timestamp));
            if (dayjs(existingEntity.updated_at) < dayjs(entityAction.timestamp)) {
              const updatedEntities = await entityDataRepository.update({ id: existingEntity.id }, { content: { ...existingEntity.content, ...entityAction.payload as object }, updated_at: entityAction.timestamp });
              if (updatedEntities.affected != null) {
                updatedFields += updatedEntities.affected;
              }
            }
          }
        } else if (entityAction.action === "DELETE") {
          const updatedEntities = await entityDataRepository.delete({ id: entityAction.entity_id });
          if (updatedEntities.affected != null) {
            updatedFields = updatedEntities.affected;
          }
        }
        await entityHistoryRepository.save({
          user_id: appkey.user_id,
          project_id: appkey.project_id,
          id: entityAction.request_id,
          entity_name: entityAction.entity_name,
          entity_id: entityAction.entity_id,
          host_id: entityAction.host_id,
          action: entityAction.action,
          payload: entityAction.action === "DELETE" ? {} : entityAction.payload,
          timestamp: entityAction.timestamp,
        });
        const response = { affectedrows: updatedFields, entity_name: entityAction.entity_name };
        responses.push(response);
      }
      return responses;
    });
    return response;
  }
}