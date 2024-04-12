import { getprofileUseCase } from "@/use-cases/get-profile-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getProfileController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { user } = await getprofileUseCase({
      userId: req.user.sub,
    });

    return reply.status(200).send({ user });
  } catch (error) {
    console.log(error);
  }
}
