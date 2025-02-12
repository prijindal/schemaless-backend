import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import http from "http";

import axios from "axios";
import { random } from "lodash";
import { bootstrap, shutdownTestServer } from "./helpers/bootstrap";

describe("Registration API", () => {
  let server: http.Server;
  const port = random(1025, 2000);
  beforeAll((done) => {
    bootstrap({ port, }).then((s) => {
      server = s;
      done();
    });
  });

  const host = `http://localhost:${port}`;

  it("Creates an admin user and check if verify auth works", async () => {
    const response = await axios.post(`${host}/user/login/initialize`, {
      username: "admin",
      password: "admin",
      validateStatus: (status: number) => status > 100,
    });

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(true);
  })

  afterAll(async () => {
    await shutdownTestServer(server);
  });
});
