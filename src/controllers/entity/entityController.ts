import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Post, Request, Route, Security, Tags } from "tsoa";
import { EntityHistoryRepository } from "../../repositories/entity_history.repository";
import { AppKeyAuthorizedRequest } from "../../types/auth.types";
import { EntityAction, EntityActionResponse, EntityActionService, EntityHistoryRequest, EntityHistoryResponse, EntitySearchRequest, EntitySearchResponse } from "./entityService";

@Tags("entity")
@Route("/entity")
@Security("bearer_appkey")
@provide(EntityController)
export class EntityController {
  constructor(
    @inject(EntityActionService) private entityActionService: EntityActionService,
    @inject(EntityHistoryRepository) private entityHistoryRepository: EntityHistoryRepository,
  ) { }

  @Post("/data/search")
  async searchEntitiesData(@Body() body: EntitySearchRequest[], @Request() request: AppKeyAuthorizedRequest): Promise<EntitySearchResponse[]> {
    return this.entityActionService.searchEntitiesData(body, request.appkey);
  }

  @Post("/history/search")
  async searchEntitiesHistory(@Body() body: EntityHistoryRequest[], @Request() request: AppKeyAuthorizedRequest): Promise<EntityHistoryResponse[]> {
    return this.entityActionService.searchEntitiesHistory(body, request.appkey);
  }

  @Post("/action")
  async entityAction(@Body() body: EntityAction[], @Request() request: AppKeyAuthorizedRequest): Promise<EntityActionResponse[]> {
    return this.entityActionService.entityAction(body, request.appkey);

  }
}