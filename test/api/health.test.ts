import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import http from "http";

import axios from "axios";
import { random } from "lodash";
import { shutdown } from "../../src/app";
import { bootstrap } from "./helpers/bootstrap";

describe("Health API", () => {
  let server: http.Server;
  const port = random(1025, 2000);
  beforeAll((done) => {
    bootstrap({ port, }).then((s) => {
      server = s;
      done();
    });
  });

  it("Check health", async () => {
    const response = await axios.get(`http://localhost:${port}/health`);
    expect(response.status).toEqual(200);
  });

  afterAll(async () => {
    await shutdown();
    server.close();
  });
});
