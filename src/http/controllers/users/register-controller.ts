import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error";
import { registerUseCase } from "@/use-cases/register-use-case";
import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function registerController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  });

  const { name, email, phone } = registerBodySchema.parse(req.body);

  try {
    const { user } = await registerUseCase({
      name,
      email,
      phone,
    });

    return reply.status(201).send({ user });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return reply.status(409).send({
          message:
            "There is a unique constraint violation, a new user cannot be created with this email or phone",
        });
      }
    }
  }
}
