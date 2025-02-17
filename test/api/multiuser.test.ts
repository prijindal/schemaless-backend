import http from "http";

import axios, { AxiosError, AxiosResponse } from "axios";
import { random } from "lodash";
import { bootstrap, shutdownTestServer } from "./helpers/bootstrap";

describe("Multi User API", () => {
  let server: http.Server;
  const port = random(1025, 2000);
  beforeAll((done) => {
    bootstrap({ port, }).then((s) => {
      server = s;
      done();
    });
  });

  const host = `http://localhost:${port}`;
  let adminToken: string | undefined;
  let user1Id: string | undefined;
  let user1Token: string | undefined;

  it("Creates an admin user and login", async () => {
    const response = await axios.post(`${host}/user/login/initialize`, {
      username: "admin",
      password: "admin",
    });

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(true);
    const loginResponse = await axios.post(`${host}/user/login/login`, {
      username: "admin",
      password: "admin",
    });

    expect(loginResponse.status).toEqual(200);
    adminToken = loginResponse.data;
  })

  it("Register a secondary user and check that it's auth is invalid", async () => {
    const username = "user1";
    const response = await axios.post(`${host}/user/login/register`, {
      username: username,
      password: "user1",
    });

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(true);

    let loginResponse: AxiosResponse | undefined;
    try {
      loginResponse = await axios.post(`${host}/user/login/login`, {
        username: username,
        password: "user1",
      });
    } catch (e: unknown) {
      expect((e as AxiosError).isAxiosError).toEqual(true);
      expect((e as AxiosError).response).not.toBeNull();
      loginResponse = (e as AxiosError).response;
    }

    expect(loginResponse).not.toBeUndefined();
    expect(loginResponse!.status).toEqual(401);

    expect(loginResponse!.data.class_name).toEqual("UserUnauthorizedError");
  });

  it("List users using admin token", async () => {
    const response = await axios.get(`${host}/user/admin`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.length).toEqual(2);
    expect(response.data[1].username).toEqual("user1");
    user1Id = response.data[1].id;
  })

  it("approve secondary user", async () => {
    const response = await axios.post(`${host}/user/admin/${user1Id}/approval`, {
      approval: true,
    }, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(true);
  })

  it("Login secondary user", async () => {
    const loginResponse = await axios.post(`${host}/user/login/login`, {
      username: "user1",
      password: "user1",
    });

    expect(loginResponse.status).toEqual(200);
    user1Token = loginResponse.data;
  });

  it("Test auth of secondary user", async () => {
    const response = await axios.get(`${host}/auth/user`, {
      headers: {
        Authorization: `Bearer ${user1Token}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.status).toEqual("ACTIVATED");
    expect(response.data.is_admin).toEqual(false);
  })

  it("secondary user should not allowed to use admin api", async () => {
    let response: AxiosResponse | undefined;
    try {
      response = await axios.get(`${host}/user/admin`, {
        headers: {
          Authorization: `Bearer ${user1Token}`,
          "accept": "application/json",
        }
      });
    } catch (e) {
      expect((e as AxiosError).isAxiosError).toEqual(true);
      expect((e as AxiosError).response).not.toBeNull();
      response = (e as AxiosError).response;
    }

    expect(response).not.toBeUndefined();
    expect(response!.status).toEqual(404);
  })

  afterAll(async () => {
    await shutdownTestServer(server);
  });
});
