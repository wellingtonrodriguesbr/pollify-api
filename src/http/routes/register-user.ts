import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";

export async function registerUser(app: FastifyInstance) {
  app.post("/users", async (request, reply) => {
    const registerUserBody = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = registerUserBody.parse(request.body);
    const password_hash = await hash(password, 6);

    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      throw new Error("User already exists!");
    }

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: password_hash,
        },
      });

      return reply.status(201).send({ user });
    } catch (error) {
      console.log(error);
    }
  });
}
