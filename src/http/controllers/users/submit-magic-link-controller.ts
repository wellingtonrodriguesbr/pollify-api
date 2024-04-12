import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { submitMagicLinkUseCase } from "@/use-cases/submit-magic-link-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function submitMagiclinkController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const submitmagiclinkBodySchema = z.object({
    email: z.string(),
  });

  const { email } = submitmagiclinkBodySchema.parse(request.body);

  try {
    await submitMagicLinkUseCase({ email });

    return reply.status(200).send();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    } else if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
