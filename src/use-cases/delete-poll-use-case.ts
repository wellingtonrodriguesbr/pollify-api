import { prisma } from "@/lib/prisma";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface DeletePollUseCaseRequest {
  userId: string;
  pollId: string;
}

interface DeletePollUseCaseResponse {}

export async function deletePollUseCase({
  userId,
  pollId,
}: DeletePollUseCaseRequest): Promise<DeletePollUseCaseResponse> {
  const poll = await prisma.poll.findUnique({
    where: {
      userId,
      id: pollId,
    },
  });

  if (!poll) {
    throw new ResourceNotFoundError();
  }

  await prisma.poll.delete({
    where: {
      userId,
      id: poll.id,
    },
  });

  return {};
}
