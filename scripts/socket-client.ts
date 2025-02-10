import Client from "socket.io-client";

const client = Client("ws://localhost:3000", { transports: ["websocket"] });

client.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

client.send("Hello World");