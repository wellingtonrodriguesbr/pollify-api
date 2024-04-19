import { deletePollUseCase } from "@/use-cases/delete-poll-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function deletePollController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const deletePollBodySchema = z.object({
    pollId: z.string().uuid(),
  });

  const { pollId } = deletePollBodySchema.parse(req.params);

  try {
    await deletePollUseCase({
      userId: req.user.sub,
      pollId,
    });

    return reply.status(200).send();
  } catch (error) {
    console.log(error);
  }
}
