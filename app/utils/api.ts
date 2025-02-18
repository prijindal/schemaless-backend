export async function verifyUser(token: string) {

  try {
    const response = await fetch("http://127.0.0.1:3000/api/auth/user", {
      headers: {
        "Authorization": "Bearer " + token

      }
    })
    if (response.status == 200) {
      return response.json();
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
      return response.json();
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function loginUser(username: string, password: string): Promise<string | null> {
  const response = await fetch("http://127.0.0.1:3000/api/user/login/login", {
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