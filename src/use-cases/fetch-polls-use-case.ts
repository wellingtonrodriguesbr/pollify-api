import { prisma } from "@/lib/prisma";

interface FetchPollsUseCaseRequest {
  userId: string;
}

interface Poll {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FetchPollsUseCaseResponse {
  polls: Poll[];
}

export async function fetchPollsUseCaseUseCase({
  userId,
}: FetchPollsUseCaseRequest): Promise<FetchPollsUseCaseResponse> {
  const polls = await prisma.poll.findMany({
    where: {
      userId,
    },
    include: {
      votes: {
        select: {
          id: true,
        },
      },
    },
  });

  return { polls };
}
