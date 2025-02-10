import http from "http";
import { app } from "../../../src/app";
import { options } from "../../../src/db/typeorm_options";
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
