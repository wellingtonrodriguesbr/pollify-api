import { createPollUseCaseUseCase } from "@/use-cases/create-poll-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createPollController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const createPollBodySchema = z.object({
    title: z.string(),
    options: z.array(
      z.object({
        option: z.string(),
      })
    ),
  });

  const { title, options } = createPollBodySchema.parse(req.body);

  try {
    const { poll } = await createPollUseCaseUseCase({
      userId: req.user.sub,
      title,
      options,
    });

    return reply.status(201).send({ pollId: poll.id });
  } catch (error) {
    console.log(error);
  }
}
