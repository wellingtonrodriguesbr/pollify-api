import "dotenv/config";

import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyWebsocket from "@fastify/websocket";

import { pollResults } from "./ws/poll-results";
import { pollsRoutes } from "./controllers/polls/routes";
import { usersRoutes } from "./controllers/users/routes";

export const app = fastify({
  logger: true,
});

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
  secret: process.env.COOKIE_SECRET_KEY!,
  hook: "onRequest",
});

app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN_URL,
  credentials: true,
});

app.register(fastifyWebsocket);

app.register(pollsRoutes);
app.register(usersRoutes);

app.register(pollResults);
