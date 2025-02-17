import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { Body, Get, Post, Request, Route, Security, SuccessResponse, Tags } from "tsoa";
import type { UserAuthorizedRequest } from "../../types/auth.types";
import type { EntityAction, EntityActionResponse, EntityHistoryRequest, EntityHistoryResponse } from "./entityService";
import { EntityActionService } from "./entityService";

@Tags("entity")
@Route("/entity")
@Security("bearer_auth")
@provide(EntityController)
export class EntityController {
  constructor(
    @inject(EntityActionService) private entityActionService: EntityActionService,
  ) { }

  @Get("history/entities")
  @SuccessResponse(200)
  async getEntities(@Request() request: UserAuthorizedRequest): Promise<string[]> {
    return this.entityActionService.getEntities(request.loggedInUser.id);
  }

  @Post("/history/search")
  async searchEntitiesHistory(@Body() body: EntityHistoryRequest[], @Request() request: UserAuthorizedRequest): Promise<EntityHistoryResponse[]> {
    return this.entityActionService.searchEntitiesHistory(body, request.loggedInUser.id);
  }

  @Post("/action")
  async entityAction(@Body() body: EntityAction[], @Request() request: UserAuthorizedRequest): Promise<EntityActionResponse[]> {
    return this.entityActionService.entityAction(body, request.loggedInUser.id);

  }
}