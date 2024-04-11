import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { verifyJWT } from "../middlewares/verify-jwt";

export async function createPoll(app: FastifyInstance) {
  app.post("/polls", { onRequest: [verifyJWT] }, async (request, reply) => {
    const createPollBody = z.object({
      title: z.string(),
      options: z.array(
        z.object({
          option: z.string(),
        })
      ),
    });

    const { title, options } = createPollBody.parse(request.body);

    try {
      const poll = await prisma.poll.create({
        data: {
          userId: request.user.sub,
          title,
          options: {
            createMany: {
              data: options.map(({ option }) => {
                return {
                  title: option,
                };
              }),
            },
          },
        },
        include: {
          options: true,
        },
      });

      return reply.status(201).send({ pollId: poll.id });
    } catch (error) {
      console.log(error);
    }
  });
}
