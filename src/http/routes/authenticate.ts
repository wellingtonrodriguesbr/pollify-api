import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { compare } from "bcryptjs";

export async function authenticate(app: FastifyInstance) {
  app.post("/sessions", async (request, reply) => {
    const authenticateBody = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = authenticateBody.parse(request.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("User not found!");
    }

    const doesPasswordMatches = await compare(password, user.passwordHash);

    if (!doesPasswordMatches) {
      throw new Error("Invalid credentials");
    }

    try {
      const token = await reply.jwtSign({
        sign: {
          sub: user.id,
        },
      });

      const refreskToken = await reply.jwtSign({
        sign: {
          sub: user.id,
          expiresIn: "7d",
        },
      });

      reply
        .setCookie("refreshToken", refreskToken, {
          path: "/",
          secure: true,
          sameSite: true,
          httpOnly: true,
        })
        .status(200)
        .send({ token });
    } catch (error) {
      if (error) {
        return reply.status(400).send({ message: "Invalid credentials" });
      }
      throw error;
    }

    return reply.status(200).send();
  });
}
