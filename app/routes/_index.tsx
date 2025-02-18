import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { getEntities, verifyUser } from "../utils/api";
import { extractJwtToken } from "../utils/user";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const token = await extractJwtToken(request);
  if (token == null) {
    return null;
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
  const user = useLoaderData<typeof loader>();
  return <div>
    Home Page: {user.username}
    Entities: {user.entities.map((entity) => <div>{entity}</div>)}
  </div>
}
