import 'dotenv/config';

import http from "http";
import SocketIO from "socket.io";
import { logger } from "./logger";

import { app, shutdown } from "./app";

import { HOST, PORT } from './config';
import { setup } from "./setup";


const server = http.createServer(app);
const io = new SocketIO.Server(server);

const listener = server.listen(PORT, HOST, 0, () =>
  logger.info(`Example app listening at http://${HOST}:${PORT}`)
);

io.on("connection", (socket) => {
  logger.info("New Connection", socket.connected);
});

const close = async () => {
  listener.close();
  server.close();
  await shutdown();
  process.exit();
};

setup().catch(close);

process.on("SIGINT", close);
process.on("SIGTERM", close);
