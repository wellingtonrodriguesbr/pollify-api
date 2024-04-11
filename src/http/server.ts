import "dotenv/config";

import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyWebsocket from "@fastify/websocket";

import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import { pollResults } from "./ws/poll-results";
import { fetchPolls } from "./routes/fetch-polls";
import { registerUser } from "./routes/register-user";
import { authenticate } from "./routes/authenticate";
import { submitMagicLink } from "./routes/submit-magic-link";
import { refresh } from "./routes/refresh";
import { getProfile } from "./routes/get-profile";

const app = fastify();

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "7d",
  },
});

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET_KEY,
  hook: "onRequest",
});

app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN_URL,
  credentials: true,
});

app.register(fastifyWebsocket);

app.register(fetchPolls);
app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);
app.register(pollResults);
app.register(registerUser);
app.register(authenticate);
app.register(submitMagicLink);
app.register(refresh);
app.register(getProfile);

app
  .listen({ port: Number(process.env.PORT || 3333), host: "0.0.0.0" })
  .then(() => {
    console.log("HTTP Server is running!");
  });
