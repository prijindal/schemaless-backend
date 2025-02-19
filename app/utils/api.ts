import type { UserVerifyResponse } from "../../src/controllers/auth/authVerifyController";
import type { EntityHistoryRequest, EntityHistoryResponse } from "../../src/controllers/entity/entityService";

export async function isInitialized(): Promise<boolean> {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/user/login/initialized");

    if (response.status == 200) {
      return (await response.json()).isInitialized as boolean;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function verifyUser(token: string): Promise<UserVerifyResponse | null> {

  try {
    const response = await fetch("http://127.0.0.1:3000/api/auth/user", {
      headers: {
        "Authorization": "Bearer " + token

      }
    })
    if (response.status == 200) {
      return (await response.json()) as UserVerifyResponse;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getEntities(token: string): Promise<string[]> {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/entity/history/entities", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });
    if (response.status == 200) {
      return (await response.json()) as string[];
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getEntitiesHistory(token: string, entities: string[]): Promise<EntityHistoryResponse[]> {
  try {
    const body: EntityHistoryRequest[] = entities.map((entity) => ({ entity_name: entity, params: {}, order: { "timestamp": "desc" } })) as unknown as EntityHistoryRequest[];
    const response = await fetch("http://127.0.0.1:3000/api/entity/history/search", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    });
    if (response.status == 200) {
      return (await response.json()) as EntityHistoryResponse[];
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function loginUser(username: string, password: string): Promise<string | null> {
  const response = await fetch("http://127.0.0.1:3000/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (response.status == 200) {
    return (await response.json()) as string;
  } else {
    return null;
  }
}

export async function initializeUser(username: string, password: string): Promise<string | null> {
  const response = await fetch("http://127.0.0.1:3000/api/user/login/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (response.status == 200) {
    return (await response.json()) as string;
  } else {
    return null;
  }
}

export async function registerUser(username: string, password: string): Promise<string | null> {
  const response = await fetch("http://127.0.0.1:3000/api/user/login/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (response.status == 200) {
    return (await response.json()) as string;
  } else {
    return null;
  }
}