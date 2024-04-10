import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { generateRamdonCode } from "@/utils/generate-random-code";
import { resend } from "@/mail/client";

import AuthenticationMagicLinkEmail from "@/mail/templates/authentication-magic-link";

export async function submitMagicLink(app: FastifyInstance) {
  app.post("/sessions/submit-magic-link", async (request, reply) => {
    const registerUserBody = z.object({
      email: z.string().email(),
    });

    const { email } = registerUserBody.parse(request.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new Error("User not found!");
    }

    try {
      const code: string = generateRamdonCode();
      const link = `${process.env.WEBSITE_DOMAIN_URL}/entrar?codigo=${code}`;

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
          userId: user!.id,
        },
      });

      return reply.status(200).send();
    } catch (error) {
      if (error) {
        return reply.status(401).send({ message: "Invalid credentials" });
      }
    }
  });
}
