import React from "react";
import { ActionFunction, ActionFunctionArgs, Form, redirect } from "react-router";
import { loginUser } from "../utils/api";
import { setUser } from "../utils/user";

export default function Login({
  actionData,
}) {
  return <div>
    <Form method="POST">
      {actionData?.error && <div>{actionData.error}</div>}
      <input type="text" name="username" />
      <input type="password" name="password" />
      <input type="submit" />
    </Form>
  </div>
}

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const bodyParams = await request.formData();

  const username = bodyParams.get("username");
  const password = bodyParams.get("password");

  const response = await loginUser(username?.slice() as string, password?.slice() as string);

  if (response != null) {
    return redirect("/", {
      headers: {
        "Set-Cookie": await setUser(request, response),
      },
    });
  } else {
    return {
      error: "Invalid username or password"
    };
  }
}