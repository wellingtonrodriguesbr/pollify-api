import { FastifyInstance } from "fastify";
import { verifyJWT } from "@/http/middlewares/verify-jwt";

import { createPollController } from "./create-poll-controller";
import { fetchPollsController } from "./fetch-polls-controller";
import { getPollController } from "./get-poll-controller";

export async function pollsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJWT);

  app.post("/polls", createPollController);
  app.get("/polls", fetchPollsController);
  app.get("/polls/:pollId", getPollController);
}
