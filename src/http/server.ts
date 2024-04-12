import { app } from "./app";

app
  .listen({ port: Number(process.env.PORT || 3333), host: "0.0.0.0" })
  .then(() => {
    console.log("HTTP Server is running!");
  });
