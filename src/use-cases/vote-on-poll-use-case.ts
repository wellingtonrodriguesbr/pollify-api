import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { voting } from "@/utils/voting-pub-sub";

interface VoteOnPollUseCaseRequest {
  sessionId: string;
  pollId: string;
  pollOptionId: string;
}

export async function voteOnPollUseCaseUseCase({
  sessionId,
  pollId,
  pollOptionId,
}: VoteOnPollUseCaseRequest) {
  const userPreviousVoteOnPoll = await prisma.vote.findUnique({
    where: {
      sessionId_pollId: {
        sessionId,
        pollId,
      },
    },
  });

  if (
    userPreviousVoteOnPoll &&
    userPreviousVoteOnPoll.pollOptionId !== pollOptionId
  ) {
    await prisma.vote.delete({
      where: {
        id: userPreviousVoteOnPoll.id,
      },
    });

    const votes = await redis.zincrby(
      pollId,
      -1,
      userPreviousVoteOnPoll.pollOptionId
    );

    voting.publish(pollId, {
      pollOptionId: userPreviousVoteOnPoll.pollOptionId,
      votes: Number(votes),
    });
  }

  await prisma.vote.create({
    data: {
      sessionId,
      pollId,
      pollOptionId,
    },
  });

  const votes = await redis.zincrby(pollId, 1, pollOptionId);

  voting.publish(pollId, {
    pollOptionId,
    votes: Number(votes),
  });
}
