import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { redis } from "../../lib/redis";
import { verifyJWT } from "../middlewares/verify-jwt";

export async function getPoll(app: FastifyInstance) {
  app.get(
    "/polls/:pollId",
    { onRequest: [verifyJWT] },
    async (request, reply) => {
      const getPollparams = z.object({
        pollId: z.string().uuid(),
      });

      const { pollId } = getPollparams.parse(request.params);

      const poll = await prisma.poll.findUnique({
        where: {
          userId: request.user.sub,
          id: pollId,
        },
        include: {
          options: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (!poll) {
        reply.status(400).send({ message: "Poll not found." });
      }

      const result = await redis.zrange(pollId, 0, -1, "WITHSCORES");

      const votes = result.reduce((acc, currentValue, index) => {
        if (index % 2 === 0) {
          const score = result[index + 1];

          Object.assign(acc, { [currentValue]: Number(score) });
        }

        return acc;
      }, {} as Record<string, number>);

      return reply.send({
        poll: {
          id: poll?.id,
          title: poll?.title,
          options: poll?.options.map((option) => {
            return {
              id: option.id,
              title: option.title,
              score: option.id in votes ? votes[option.id] : 0,
            };
          }),
        },
      });
    }
  );
}
