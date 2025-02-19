import React from "react";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getEntities, verifyUser } from "../utils/api";
import { extractJwtToken } from "../utils/user";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const token = await extractJwtToken(request);
  if (token == null) {
    return redirect("/login",);
  }

  const user = await verifyUser(token);
  if (user == null) {
    return redirect("/login",);
  }
  const entities = await getEntities(token);
  return Response.json({
    username: user.username,
    entities,
  });
}

export default function Login() {
  const user = useLoaderData<typeof loader>() as { username: string; entities: string[] };
  return <div>
    Home Page: {user.username}
    Entities: {user.entities.map((entity) => <div>{entity}</div>)}
  </div>
}
