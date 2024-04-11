import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { generateRamdonCode } from "@/utils/generate-random-code";
import { resend } from "@/mail/client";

import AuthenticationMagicLinkEmail from "@/mail/templates/authentication-magic-link";

export async function registerUser(app: FastifyInstance) {
  app.post("/users", async (request, reply) => {
    const registerUserBody = z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
    });

    const { name, email, phone } = registerUserBody.parse(request.body);

    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      return reply.status(400).send({ message: "User already exists!" });
    }

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          status: "PENDING",
        },
      });

      const code: string = generateRamdonCode();
      const link = `${process.env.WEBSITE_DOMAIN_URL}/entrar?codigo=${code}`;

      const { data, error } = await resend.emails.send({
        from: process.env.SENDER_EMAIL!,
        to: [email],
        subject: "Registro na plataforma",
        react: AuthenticationMagicLinkEmail({
          userEmail: email,
          authLink: link,
        }),
      });

      console.log("email enviado: ", data);
      console.log("erro: ", error);

      await prisma.authLink.create({
        data: {
          code,
          userId: user.id,
        },
      });

      return reply.status(201).send({ user });
    } catch (error) {
      console.log(error);
    }
  });
}
