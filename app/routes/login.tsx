import { Alert, Button, Center, Flex, Group, TextInput } from '@mantine/core';
import React from "react";
import { ActionFunction, ActionFunctionArgs, Form, Link, redirect } from "react-router";
import { isInitialized, loginUser } from "../utils/api";
import { setUser } from "../utils/user";

export async function loader() {
  const initialized = await isInitialized();
  if (!initialized) {
    return redirect("/initialize",);
  }
  return Response.json({});
}

export default function Login({
  actionData,
}) {
  return <Flex direction="row" justify="center" align="start">
    <Center maw={400} w="100%" mt="xl" p="xl" bg="var(--mantine-color-gray-light)">
      <Form method="POST">
        {actionData?.error && <Alert variant="filled" color="red" title="Error">{actionData.error} </Alert>
        }
        <TextInput label="Username" type="text" name="username" />
        <TextInput label="Password" type="password" name="password" />
        <Group justify="center" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
        <Group justify="center" mt="md">
          <Button component={Link} to="/register" type="button">Register</Button>
        </Group>
      </Form>
    </Center>
  </Flex>
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