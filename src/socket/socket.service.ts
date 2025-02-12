import { inject } from "inversify";
import { Socket } from "socket.io";
import { AppKeyAuthService } from "../auth/appkey.user.service";
import { EntityActionResponse, EntityActionService, EntityHistoryResponse, EntitySearchResponse } from "../controllers/entity/entityService";
import { extractTokenFromHeaders } from "../helpers/token";
import { logger } from "../logger";
import { singleton } from "../singleton";
import { ConnectionManager } from "./connectionmanager.service";

@singleton(SocketController)
export class SocketController {
  constructor(
    @inject(AppKeyAuthService) private appKeyAuthService: AppKeyAuthService,
    @inject(EntityActionService) private entityActionService: EntityActionService,
    @inject(ConnectionManager) private connectionManager: ConnectionManager,
  ) { }

  async connectionListener(socket: Socket) {
    try {
      const token = extractTokenFromHeaders(socket.handshake.headers);
      const appkeyPayload = await this.appKeyAuthService.verifyToken(token);
      if (appkeyPayload == null) {
        logger.info("Invalid connection, disconnecting");
        socket.disconnect();
        return;
      }
      logger.info("New Connection", socket.connected);
      socket.on("search_entities", async (body: string, callback: (f: EntitySearchResponse[]) => void) => {
        try {
          const response = await this.entityActionService.searchEntitiesData(JSON.parse(body), appkeyPayload.appkey);
          callback(response);
        } catch (e) {
          logger.error(e);
        }
      })
      socket.on("search_history", async (body: string, callback: (f: EntityHistoryResponse[]) => void) => {
        try {
          const response = await this.entityActionService.searchEntitiesHistory(JSON.parse(body), appkeyPayload.appkey);
          callback(response);
        } catch (e) {
          logger.error(e);
        }
      })
      socket.on("actions", async (body: string, callback: (f: EntityActionResponse[]) => void) => {
        try {
          const response = await this.entityActionService.entityAction(JSON.parse(body), appkeyPayload.appkey);
          callback(response.actionResponse);
          this.connectionManager.emitOnAllConnections(appkeyPayload.appkey.project_id, "server_actions", response.historyResponse, [socket.id]);
        } catch (e) {
          logger.error(e);
        }
      })
      socket.emit("connected");
      this.connectionManager.onConnect(appkeyPayload.appkey.project_id, socket);
      socket.on("disconnect", () => {
        this.connectionManager.onDisconnect(appkeyPayload.appkey.project_id, socket.id);
      });
    } catch (e) {
      logger.error(e);
      socket.disconnect();
      return;
    }
  }
}