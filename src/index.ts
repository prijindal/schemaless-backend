import http from "http";
import { Server } from "socket.io";
import { logger } from "./logger";

import { SocketController } from './socket/socket.service';

import { app, shutdown } from "./app";

import { HOST, PORT } from './config';
import { iocContainer } from './ioc';
import { setup } from "./setup";


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on("connection", (socket) => iocContainer.get(SocketController).connectionListener(io, socket));

const listener = server.listen(PORT, HOST, 0, () =>
  logger.info(`Example app listening at http://${HOST}:${PORT}`)
);
const close = async () => {
  logger.warn("Closing server ....");
  listener.close();
  server.close();
  await shutdown();
  process.exit();
};

setup().catch(close);

process.on("SIGINT", close);
process.on("SIGTERM", close);
