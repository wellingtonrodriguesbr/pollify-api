import "dotenv/config";

import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";

import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import { pollResults } from "./ws/poll-results";
import { fetchPolls } from "./routes/fetch-polls";

const app = fastify();

app.register(fastifyCookie, {
  secret: "my-super-secret-key",
  hook: "onRequest",
});

app.register(fastifyCors, {
  origin: "*",
  credentials: true,
});

app.register(fastifyWebsocket);

app.register(fetchPolls);
app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);
app.register(pollResults);

app
  .listen({ port: Number(process.env.PORT || 3333), host: "0.0.0.0" })
  .then(() => {
    console.log("HTTP Server is running!");
  });
