import http from "http";
import { app, shutdown } from "../../../src/app";
import { TypeOrmConnection } from "../../../src/db/typeorm";
import { options } from "../../../src/db/typeorm_options";
import { iocContainer } from "../../../src/ioc";
import { setup } from "../../../src/setup";

export const bootstrap = async ({
  port,
}: {
  port: number;
}) => {
  const server = http.createServer(app);
  await setup(options);
  return server.listen(port);
};

export const shutdownTestServer = async (server: http.Server) => {
  await iocContainer.get(TypeOrmConnection).getInstance().dropDatabase();
  await shutdown();
  server.close();
}