import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { verifyJWT } from "../middlewares/verify-jwt";

export async function getProfile(app: FastifyInstance) {
  app.get("/me", { onRequest: [verifyJWT] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: {
        id: request.user.sub,
      },
    });

    return reply.send({
      user,
    });
  });
}
