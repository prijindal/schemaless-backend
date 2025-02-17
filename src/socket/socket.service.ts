import { inject } from "inversify";
import { Server, Socket } from "socket.io";
import { UserAuthService } from "../auth/auth.user.service";
import { type EntityActionResponse, EntityActionService, type EntityHistoryResponse } from "../controllers/entity/entityService";
import { extractTokenFromHeaders } from "../helpers/token";
import { logger } from "../logger";
import { singleton } from "../singleton";

@singleton(SocketController)
export class SocketController {
  constructor(
    @inject(UserAuthService) private userAuthService: UserAuthService,
    @inject(EntityActionService) private entityActionService: EntityActionService,
  ) {
  }

  async connectionListener(io: Server, socket: Socket) {
    try {
      const token = extractTokenFromHeaders(socket.handshake.headers);
      const user = await this.userAuthService.verifyToken(token);
      if (user == null) {
        logger.info("Invalid connection, disconnecting");
        socket.disconnect();
        return;
      }
      socket.join(user.id);
      logger.info("New Connection", socket.connected);
      socket.on("search_history", async (body: string, callback: (f: EntityHistoryResponse[]) => void) => {
        try {
          const response = await this.entityActionService.searchEntitiesHistory(JSON.parse(body), user.id);
          callback(response);
        } catch (e) {
          logger.error(e);
        }
      })
      socket.on("actions", async (body: string, callback: (f: EntityActionResponse[]) => void) => {
        try {
          const response = await this.entityActionService.entityAction(JSON.parse(body), user.id);
          callback(response);
          io.to(user.id).emit("server_actions", { rows: response.reduce<number>((a, b) => a + b.affectedrows, 0) });
        } catch (e) {
          logger.error(e);
        }
      })
      socket.emit("connected");
    } catch (e) {
      logger.error(e);
      socket.disconnect();
      return;
    }
  }
}