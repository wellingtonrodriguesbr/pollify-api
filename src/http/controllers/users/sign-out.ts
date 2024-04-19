import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function signOutController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  await req.jwtVerify({ onlyCookie: true });

  try {
    reply.clearCookie("refreshToken", {
      path: "/",
      domain: process.env.COOKIES_DOMAIN,
    });
    await reply.jwtSign(
      {},
      {
        sign: {
          sub: req.user.sub,
          expiresIn: 3,
        },
      }
    );

    return reply.send({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    } else {
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
