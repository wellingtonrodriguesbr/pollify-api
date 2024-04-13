import { voteOnPollUseCaseUseCase } from "@/use-cases/vote-on-poll-use-case";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function voteOnPollController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const voteOnPollBody = z.object({
    pollOptionId: z.string().uuid(),
  });

  const voteOnPollParams = z.object({
    pollId: z.string().uuid(),
  });

  const { pollId } = voteOnPollParams.parse(req.params);
  const { pollOptionId } = voteOnPollBody.parse(req.body);

  let { sessionId } = req.cookies;

  if (!sessionId) {
    sessionId = randomUUID();

    reply.setCookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      signed: true,
      httpOnly: true,
    });
  }

  try {
    await voteOnPollUseCaseUseCase({
      sessionId,
      pollId,
      pollOptionId,
    });

    return reply.status(201).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return reply.status(409).send({
          message: "You have already voted on this poll",
        });
      }
    }
    console.log(error);
  }
}
