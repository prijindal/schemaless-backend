import { Socket } from "socket.io";
import { singleton } from "../singleton";

@singleton(ConnectionManager)
export class ConnectionManager {
  private connections: Record<string, Socket[]> = {};

  onConnect(user_id: string, socket: Socket) {
    if (this.connections[user_id] == null) {
      this.connections[user_id] = [];
    }
    this.connections[user_id].push(socket);
  }

  onDisconnect(user_id: string, socket_id: string) {
    if (this.connections[user_id] == null) {
      return;
    }
    this.connections[user_id] = this.connections[user_id].filter((socket) => socket.id !== socket_id);
  }

  emitOnAllConnections(user_id: string, name: string, action: object, exclude_socketids: string[]) {
    if (this.connections[user_id] == null) {
      return;
    }
    this.connections[user_id].forEach((socket) => {
      if (exclude_socketids.indexOf(socket.id) === -1) {
        socket.emit(name, action);
      }
    });
  }
}