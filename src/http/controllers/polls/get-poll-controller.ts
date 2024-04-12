import { getPollUseCase } from "@/use-cases/get-poll-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getPollController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const getPollBodySchema = z.object({
    pollId: z.string().uuid(),
  });

  const { pollId } = getPollBodySchema.parse(req.params);

  try {
    const { poll } = await getPollUseCase({
      userId: req.user.sub,
      pollId,
    });

    return reply.status(200).send({ poll });
  } catch (error) {
    console.log(error);
  }
}
