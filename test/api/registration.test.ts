import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import http from "http";

import axios from "axios";
import { randomUUID } from "crypto";
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
  let jwtToken: string | undefined;
  let projectId: string | undefined;
  let appKey: string | undefined;

  it("Creates an admin user", async () => {
    const response = await axios.post(`${host}/user/login/initialize`, {
      username: "admin",
      password: "admin",
    });

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(true);
  })

  it("performm login for admin user", async () => {
    const response = await axios.post(`${host}/user/login/login`, {
      username: "admin",
      password: "admin",
    });

    expect(response.status).toEqual(200);
    jwtToken = response.data;
  });

  it("check if verify auth works", async () => {
    const response = await axios.get(`${host}/auth/user`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.status).toEqual("ACTIVATED");
  })

  it("create a project", async () => {
    const response = await axios.post(`${host}/projects`, {
      name: "test",
    }, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.name).toEqual("test");
  });

  it("lists project and verifies that project is created", async () => {
    const response = await axios.get(`${host}/projects`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.length).toEqual(1);
    expect(response.data[0].name).toEqual("test");
    projectId = response.data[0].id;
  });

  it("creates a new appkey", async () => {
    const response = await axios.post(`${host}/appkeys`, {
      project_id: projectId,
    }, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    appKey = response.data;
  });

  it("verifies the appkey", async () => {
    const response = await axios.get(`${host}/auth/appkey`, {
      headers: {
        Authorization: `Bearer ${appKey}`,
        "accept": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.project_name).toEqual("test");
  });

  it("performs some server actions with the appkey", async () => {
    const entityId = randomUUID();
    const hostId = randomUUID();
    const response = await axios.post(`${host}/entity/action`, [{
      "action": "CREATE",
      "entity_id": entityId,
      "entity_name": "todo",
      "timestamp": new Date().toISOString(),
      "request_id": randomUUID(),
      "host_id": hostId,
      payload: {
        "id": entityId,
        "title": "Some task"
      }
    }], {
      headers: {
        Authorization: `Bearer ${appKey}`,
        "accept": "application/json",
        "Content-Type": "application/json",
      }
    });

    expect(response.status).toEqual(200);
  });

  it("verifies the entity data from that appkey", async () => {
    const response = await axios.post(`${host}/entity/data/search`, [
      {
        "entity_name": "todo",
        "params": {},
        "order": {
          "updated_at": "asc"
        }
      }
    ], {
      headers: {
        Authorization: `Bearer ${appKey}`,
        "accept": "application/json",
        "Content-Type": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.length).toEqual(1);
    expect(response.data[0].entity_name).toEqual("todo");
    expect(response.data[0].data.length).toEqual(1);
    expect(response.data[0].data[0].content.title).toEqual("Some task");
  });

  it("verifies the entity history from that appkey", async () => {
    const response = await axios.post(`${host}/entity/history/search`, [
      {
        "entity_name": "todo",
        "params": {},
        "order": {
          "timestamp": "asc"
        }
      }
    ], {
      headers: {
        Authorization: `Bearer ${appKey}`,
        "accept": "application/json",
        "Content-Type": "application/json",
      }
    });

    expect(response.status).toEqual(200);
    expect(response.data.length).toEqual(1);
    expect(response.data[0].entity_name).toEqual("todo");
    expect(response.data[0].data.length).toEqual(1);
    expect(response.data[0].data[0].payload.title).toEqual("Some task");
  });

  afterAll(async () => {
    await shutdownTestServer(server);
  });
});
