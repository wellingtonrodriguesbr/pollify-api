import { prisma } from "@/lib/prisma";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UnauthorizedError } from "./errors/unauthorized-error";

import dayjs from "dayjs";

interface AuthenticateUseCaseRequest {
  code: string;
}

export async function authenticateUseCase({
  code,
}: AuthenticateUseCaseRequest) {
  const authLinkFromCode = await prisma.authLink.findUnique({
    where: {
      code,
    },
    include: {
      user: true,
    },
  });

  if (!authLinkFromCode) {
    throw new ResourceNotFoundError(
      "No authentication link with this code was found"
    );
  }

  if (dayjs().diff(authLinkFromCode.createdAt, "days") > 7) {
    throw new UnauthorizedError("This authentication code is expired");
  }

  await prisma.authLink.delete({
    where: {
      code,
    },
  });

  await prisma.user.update({
    where: {
      id: authLinkFromCode.userId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  return {
    user: authLinkFromCode.user,
  };
}
