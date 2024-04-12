import { fetchPollsUseCaseUseCase } from "@/use-cases/fetch-polls-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function fetchPollsController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { polls } = await fetchPollsUseCaseUseCase({
      userId: req.user.sub,
    });

    return reply.status(200).send({ polls });
  } catch (error) {
    console.log(error);
  }
}
