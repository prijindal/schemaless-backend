import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import http from "http";

import axios from "axios";
import { random } from "lodash";
import { bootstrap, shutdownTestServer } from "./helpers/bootstrap";

describe("Health API", () => {
  let server: http.Server;
  const port = random(1025, 2000);
  beforeAll((done) => {
    bootstrap({ port, }).then((s) => {
      server = s;
      done();
    });
  });

  const host = `http://localhost:${port}`;

  it("Check health", async () => {
    const response = await axios.get(`${host}/api/health`);
    expect(response.status).toEqual(200);
  });

  it("Check health", async () => {
    const response = await axios.get(`${host}/api/cumulative/health`);
    expect(response.status).toEqual(200);
  });

  afterAll(async () => {
    await shutdownTestServer(server);
  });
});
