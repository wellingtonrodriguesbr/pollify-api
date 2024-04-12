import { prisma } from "@/lib/prisma";

interface Option {
  option: string;
}

interface CreatePollUseCaseRequest {
  userId: string;
  title: string;
  options: Option[];
}

interface Poll {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatePollUseCaseResponse {
  poll: Poll;
}

export async function createPollUseCaseUseCase({
  userId,
  title,
  options,
}: CreatePollUseCaseRequest): Promise<CreatePollUseCaseResponse> {
  const poll = await prisma.poll.create({
    data: {
      userId,
      title,
      options: {
        createMany: {
          data: options.map(({ option }) => {
            return {
              title: option,
            };
          }),
        },
      },
    },
    include: {
      options: true,
    },
  });

  return { poll };
}
