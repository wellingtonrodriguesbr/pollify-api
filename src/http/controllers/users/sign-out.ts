import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function signOutController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  await req.jwtVerify({ onlyCookie: true });

  try {
    return reply.clearCookie("refreshToken").send({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    } else {
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
