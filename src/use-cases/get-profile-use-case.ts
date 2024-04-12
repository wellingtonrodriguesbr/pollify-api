import { prisma } from "@/lib/prisma";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
}

interface GetProfileUseCaseRequest {
  userId: string;
}

interface GetProfileUseCaseResponse {
  user: User;
}

export async function getprofileUseCase({
  userId,
}: GetProfileUseCaseRequest): Promise<GetProfileUseCaseResponse> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ResourceNotFoundError();
  }

  return {
    user,
  };
}
