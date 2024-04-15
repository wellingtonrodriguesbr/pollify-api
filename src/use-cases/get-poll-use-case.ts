import { prisma } from "@/lib/prisma";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { redis } from "@/lib/redis";

interface Option {
  id: string;
  title: string;
  score: number;
}

interface Poll {
  id: string;
  title: string;
  options: Option[];
}

interface GetPollUseCaseRequest {
  // userId: string;
  pollId: string;
}

interface GetPollUseCaseResponse {
  poll: Poll;
}

export async function getPollUseCase({
  // userId,
  pollId,
}: GetPollUseCaseRequest): Promise<GetPollUseCaseResponse> {
  const poll = await prisma.poll.findUnique({
    where: {
      // userId,
      id: pollId,
    },
    include: {
      options: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!poll) {
    throw new ResourceNotFoundError();
  }

  const result = await redis.zrange(pollId, 0, -1, "WITHSCORES");

  console.log("result", result);

  const votes = result.reduce((acc, currentValue, index) => {
    if (index % 2 === 0) {
      const score = result[index + 1];

      console.log("score", score);

      Object.assign(acc, { [currentValue]: Number(score) });
    }

    return acc;
  }, {} as Record<string, number>);

  console.log("votes", votes);

  return {
    poll: {
      id: poll?.id,
      title: poll?.title,
      options: poll?.options.map((option) => {
        return {
          id: option.id,
          title: option.title,
          score: option.id in votes ? votes[option.id] : 0,
        };
      }),
    },
  };
}
