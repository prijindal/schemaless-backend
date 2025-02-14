import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Post, Request, Route, Security, Tags } from "tsoa";
import { AppKeyAuthorizedRequest } from "../../types/auth.types";
import { EntityAction, EntityActionResponse, EntityActionService, EntityHistoryRequest, EntityHistoryResponse } from "./entityService";

@Tags("entity")
@Route("/entity")
@Security("bearer_appkey")
@provide(EntityController)
export class EntityController {
  constructor(
    @inject(EntityActionService) private entityActionService: EntityActionService,
  ) { }

  @Post("/history/search")
  async searchEntitiesHistory(@Body() body: EntityHistoryRequest[], @Request() request: AppKeyAuthorizedRequest): Promise<EntityHistoryResponse[]> {
    return this.entityActionService.searchEntitiesHistory(body, request.project.id);
  }

  @Post("/action")
  async entityAction(@Body() body: EntityAction[], @Request() request: AppKeyAuthorizedRequest): Promise<EntityActionResponse[]> {
    return this.entityActionService.entityAction(body, request.project.id);

  }
}