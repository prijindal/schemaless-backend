import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import Client from "socket.io-client";

import http from "http";

import axios from "axios";
import { random } from "lodash";
import { bootstrap, shutdownTestServer } from "./helpers/bootstrap";

describe("Socket Tests", () => {
  let server: http.Server;
  const port = random(1025, 2000);
  beforeAll((done) => {
    bootstrap({ port, }).then((s) => {
      server = s;
      done();
    });
  });

  const host = `http://localhost:${port}`;
  let jwtToken: string | undefined;

  it("Creates an admin user", async () => {
    const response = await axios.post(`${host}/api/user/login/initialize`, {
      username: "admin",
      password: "admin",
    });

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(true);
  })

  it("performm login for admin user", async () => {
    const response = await axios.post(`${host}/api/user/login`, {
      username: "admin",
      password: "admin",
    });

    expect(response.status).toEqual(200);
    jwtToken = response.data;
  });

  it("Connect to socket client", async () => {
    return new Promise((resolve, reject) => {
      const client = Client(`${host}`, {
        extraHeaders: {
          Authorization: `Bearer ${jwtToken}`,
        }
      });

      client.on("connected", () => {
        console.log("Connected to socket");
        expect(client.connected).toEqual(true);
        client.close();
        expect(client.connected).toEqual(false);
        resolve(null);
      });
    });
  })

  afterAll(async () => {
    await shutdownTestServer(server);
  });
});