import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { verifyJWT } from "../middlewares/verify-jwt";

export async function fetchPolls(app: FastifyInstance) {
  app.get("/polls", { onRequest: [verifyJWT] }, async (request, reply) => {
    const polls = await prisma.poll.findMany({
      where: {
        userId: request.user.sub,
      },
    });

    return reply.send({
      polls,
    });
  });
}
