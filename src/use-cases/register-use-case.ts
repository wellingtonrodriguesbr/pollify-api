import { prisma } from "@/lib/prisma";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import { generateRamdonCode } from "@/utils/generate-random-code";
import { resend } from "@/mail/client";

import AuthenticationMagicLinkTemplate from "@/mail/templates/authentication-magic-link";

interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
}

interface RegisterResponse {
  user: User;
}

export async function registerUseCase({
  name,
  email,
  phone,
}: RegisterRequest): Promise<RegisterResponse> {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    throw new UserAlreadyExistsError();
  }

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      status: "PENDING",
    },
  });

  const code: string = generateRamdonCode();
  const link = `${process.env.WEBSITE_DOMAIN_URL}/autenticacao?codigo=${code}`;

  await resend.emails.send({
    from: process.env.SENDER_EMAIL!,
    to: [email],
    subject: "Registro na plataforma",
    react: AuthenticationMagicLinkTemplate({
      userEmail: email,
      authLink: link,
    }),
  });

  await prisma.authLink.create({
    data: {
      code,
      userId: newUser.id,
    },
  });

  return { user: newUser };
}
