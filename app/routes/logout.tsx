import { redirect } from "react-router";
import { jwtCookie } from "../utils/user";

export async function loader() {
  return redirect("/login", {
    headers: {
      "Set-Cookie": (await jwtCookie.serialize(null)),
    },
  });
}