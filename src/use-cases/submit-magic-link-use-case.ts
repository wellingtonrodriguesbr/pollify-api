import { prisma } from "@/lib/prisma";
import { resend } from "@/mail/client";
import { generateRamdonCode } from "@/utils/generate-random-code";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import AuthenticationMagicLinkEmail from "@/mail/templates/authentication-magic-link";

interface SubmitMagicLinkUseCaseRequest {
  email: string;
}

type SubmitMagicLinkUseCaseResponse = void;

export async function submitMagicLinkUseCase({
  email,
}: SubmitMagicLinkUseCaseRequest): Promise<SubmitMagicLinkUseCaseResponse> {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new ResourceNotFoundError("User not found");
  }

  const code: string = generateRamdonCode();
  const link = `${process.env.WEBSITE_DOMAIN_URL}/autenticacao?codigo=${code}`;

  await resend.emails.send({
    from: process.env.SENDER_EMAIL!,
    to: [email],
    subject: "Login na plataforma",
    react: AuthenticationMagicLinkEmail({
      userEmail: email,
      authLink: link,
    }),
  });

  await prisma.authLink.create({
    data: {
      code,
      userId: user.id,
    },
  });
}
