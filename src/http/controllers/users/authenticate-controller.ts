import { authenticateUseCase } from "@/use-cases/authenticate-use-case";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import dayjs from "dayjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function authenticateController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authenticateBodySchema = z.object({
    code: z.string(),
  });

  const { code } = authenticateBodySchema.parse(req.body);

  try {
    const { user } = await authenticateUseCase({ code });

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
          expiresIn: "10m",
        },
      }
    );

    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      }
    );

    return reply
      .setCookie("refreshToken", refreshToken, {
        path: "/",
        secure: true,
        domain: process.env.COOKIES_DOMAIN,
        sameSite: true,
        httpOnly: true,
        expires: dayjs().add(7, "day").toDate(),
      })
      .status(200)
      .send({ token });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    } else if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
