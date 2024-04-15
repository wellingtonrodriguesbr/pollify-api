import { FastifyInstance } from "fastify";
import { verifyJWT } from "@/http/middlewares/verify-jwt";

import { createPollController } from "./create-poll-controller";
import { fetchPollsController } from "./fetch-polls-controller";
import { getPollController } from "./get-poll-controller";
import { voteOnPollController } from "./vote-on-poll-controller";

export async function pollsRoutes(app: FastifyInstance) {
  app.post("/polls", { onRequest: [verifyJWT] }, createPollController);
  app.post("/polls/:pollId/votes", voteOnPollController);
  app.get("/polls", { onRequest: [verifyJWT] }, fetchPollsController);
  app.get("/polls/:pollId", getPollController);
}
