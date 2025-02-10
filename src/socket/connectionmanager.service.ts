import { Socket } from "socket.io";
import { singleton } from "../singleton";

@singleton(ConnectionManager)
export class ConnectionManager {
  private connections: Record<string, Socket[]> = {};

  onConnect(project_id: string, socket: Socket) {
    if (this.connections[project_id] == null) {
      this.connections[project_id] = [];
    }
    this.connections[project_id].push(socket);
  }

  onDisconnect(project_id: string, socket_id: string) {
    if (this.connections[project_id] == null) {
      return;
    }
    this.connections[project_id] = this.connections[project_id].filter((socket) => socket.id !== socket_id);
  }

  emitOnAllConnections(project_id: string, name: string, action: object, exclude_socketids: string[]) {
    if (this.connections[project_id] == null) {
      return;
    }
    this.connections[project_id].forEach((socket) => {
      if (exclude_socketids.indexOf(socket.id) === -1) {
        socket.emit(name, action);
      }
    });
  }
}