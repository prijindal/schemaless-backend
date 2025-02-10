import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Post, Request, Route, Security, Tags } from "tsoa";
import { FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { EntityData } from "../../entity/entity_data.entity";
import { EntityHistory } from "../../entity/entity_history.entity";
import { EntityDataRepository } from "../../repositories/entity_data.repository";
import { EntityHistoryRepository } from "../../repositories/entity_history.repository";
import { AppKeyAuthorizedRequest } from "../../types/auth.types";

type DateParams = {
  gte?: Date;
  lte?: Date;
}

interface EntitySearchRequest {
  entity_name: string;
  params: {
    updated_at?: DateParams
    created_at?: DateParams
    ids?: string[];
  };
}

type EntitySearchResponse = {
  entity_name: string;
  data: EntityData[];
}

type EntityHistoryRequest = {
  entity_name: string;
  params: {
    created_at?: DateParams
  };
}

type EntityHistoryResponse = {
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

type EntityAction = EntityActionCreate | EntityActionUpdate | EntityActionDelete;

type EntityActionResponse = {
  entity_name: string;
  affectedrows: number;
}

@Tags("entity")
@Route("/entity")
@Security("bearer_appkey")
@provide(EntityController)
export class EntityController {
  constructor(
    @inject(EntityDataRepository) private entityDataRepository: EntityDataRepository,
    @inject(EntityHistoryRepository) private entityHistoryRepository: EntityHistoryRepository,
  ) { }

  @Post("/data/search")
  async searchEntitiesData(@Body() body: EntitySearchRequest[], @Request() request: AppKeyAuthorizedRequest): Promise<EntitySearchResponse[]> {
    const response = body.map(async (entityRequest): Promise<EntitySearchResponse> => {
      const where: FindOptionsWhere<EntityData> = {
        user_id: request.appkey.user_id,
        project_id: request.appkey.project_id,
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

  @Post("/history/search")
  async searchEntitiesHistory(@Body() body: EntityHistoryRequest[], @Request() request: AppKeyAuthorizedRequest) {
    const response = body.map(async (entityRequest): Promise<EntityHistoryResponse> => {
      const where: FindOptionsWhere<EntityData> = {
        user_id: request.appkey.user_id,
        project_id: request.appkey.project_id,
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

  @Post("/action")
  async entityAction(@Body() body: EntityAction[], @Request() request: AppKeyAuthorizedRequest): Promise<EntityActionResponse[]> {
    const responses: EntityActionResponse[] = [];
    for (const entityAction of body) {
      let updatedFields = 0;
      if (entityAction.action === "CREATE") {
        await this.entityDataRepository.createWithId({
          user_id: request.appkey.user_id,
          project_id: request.appkey.project_id,
          id: entityAction.id,
          name: entityAction.entity_name,
          content: entityAction.payload,
        });
        updatedFields = 1;
      } else if (entityAction.action === "UPDATE") {
        const updatedEntities = await this.entityDataRepository.update({ id: In(entityAction.ids) }, { content: entityAction.payload as object });
        if (updatedEntities != null) {
          updatedFields = updatedEntities;
        }
      } else if (entityAction.action === "DELETE") {
        const updatedEntities = await this.entityDataRepository.deleteMany({ id: In(entityAction.ids) });
        if (updatedEntities.affected != null) {
          updatedFields = updatedEntities.affected;
        }
      }
      await this.entityHistoryRepository.create({
        user_id: request.appkey.user_id,
        project_id: request.appkey.project_id,
        name: entityAction.entity_name,
        action: entityAction.action,
        payload: { ...entityAction.payload, ids: (entityAction.action === "CREATE") ? undefined : entityAction.ids, },
      });
      const response = { affectedrows: updatedFields, entity_name: entityAction.entity_name };
      responses.push(response);
    }
    return Promise.all(responses);

  }
}