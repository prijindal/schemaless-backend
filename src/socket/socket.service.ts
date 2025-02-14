import { inject } from "inversify";
import { Socket } from "socket.io";
import { UserAuthService } from "../auth/auth.user.service";
import { EntityActionResponse, EntityActionService, EntityHistoryResponse } from "../controllers/entity/entityService";
import { extractTokenFromHeaders } from "../helpers/token";
import { logger } from "../logger";
import { singleton } from "../singleton";
import { ConnectionManager } from "./connectionmanager.service";

@singleton(SocketController)
export class SocketController {
  constructor(
    @inject(UserAuthService) private userAuthService: UserAuthService,
    @inject(EntityActionService) private entityActionService: EntityActionService,
    @inject(ConnectionManager) private connectionManager: ConnectionManager,
  ) { }

  async connectionListener(socket: Socket) {
    try {
      const token = extractTokenFromHeaders(socket.handshake.headers);
      const appkeyPayload = await this.userAuthService.verifyToken(token);
      if (appkeyPayload == null) {
        logger.info("Invalid connection, disconnecting");
        socket.disconnect();
        return;
      }
      logger.info("New Connection", socket.connected);
      socket.on("search_history", async (body: string, callback: (f: EntityHistoryResponse[]) => void) => {
        try {
          const response = await this.entityActionService.searchEntitiesHistory(JSON.parse(body), appkeyPayload.id);
          callback(response);
        } catch (e) {
          logger.error(e);
        }
      })
      socket.on("actions", async (body: string, callback: (f: EntityActionResponse[]) => void) => {
        try {
          const response = await this.entityActionService.entityAction(JSON.parse(body), appkeyPayload.id);
          callback(response);
          this.connectionManager.emitOnAllConnections(appkeyPayload.id, "server_actions", { rows: response.reduce<number>((a, b) => a + b.affectedrows, 0) }, [socket.id]);
        } catch (e) {
          logger.error(e);
        }
      })
      socket.emit("connected");
      this.connectionManager.onConnect(appkeyPayload.id, socket);
      socket.on("disconnect", () => {
        this.connectionManager.onDisconnect(appkeyPayload.id, socket.id);
      });
    } catch (e) {
      logger.error(e);
      socket.disconnect();
      return;
    }
  }
}