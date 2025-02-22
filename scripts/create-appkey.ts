import axios from "axios";

const url = "http://127.0.0.1:3000/api";
const credentials = {
  username: "prijindal",
  password: "prijindal",
};

const main = async () => {
  try {
    await axios.post(`${url}/user/login/initialize`, {
      username: credentials.username,
      password: credentials.password,
    }, { headers: { "Content-Type": "application/json" } });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log("User already exist");
  }
  const response = await axios.post(`${url}/user/login`, {
    username: credentials.username,
    password: credentials.password,
  }, { headers: { "Content-Type": "application/json" } });
  const jwtToken = response.data;
  console.log(jwtToken);

  const projectResponse = await axios.post(`${url}/projects`, { "name": "todos" }, { headers: { "Authorization": `Bearer ${jwtToken}`, "Content-Type": "application/json" } });

  console.log(projectResponse.data);
  const project_id = projectResponse.data.id;
  console.log(project_id);


  const appKeyResponse = await axios.post(`${url}/projects/${project_id}/generatekey`, {}, { headers: { "Authorization": `Bearer ${jwtToken}`, "Content-Type": "application/json" } });

  console.log(appKeyResponse.data);
};

main();