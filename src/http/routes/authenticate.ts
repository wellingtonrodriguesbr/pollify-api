import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

import dayjs from "dayjs";

export async function authenticate(app: FastifyInstance) {
  app.get("/sessions", async (request, reply) => {
    const authenticateBody = z.object({
      code: z.string(),
    });

    const { code } = authenticateBody.parse(request.query);

    const authLinkFromCode = await prisma.authLink.findUnique({
      where: {
        code,
      },
      include: {
        user: true,
      },
    });

    if (!authLinkFromCode) {
      return reply
        .status(404)
        .send({ message: "No authentication link with this code was found" });
    }

    if (dayjs().diff(authLinkFromCode.createdAt, "days") > 7) {
      throw new Error("This authentication code is expired");
    }

    await prisma.authLink.delete({
      where: {
        code,
      },
    });

    const { id } = await prisma.user.update({
      where: {
        id: authLinkFromCode.userId,
      },
      data: {
        status: "ACTIVE",
      },
    });

    try {
      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: id,
            expiresIn: "10m",
          },
        }
      );

      const refreskToken = await reply.jwtSign(
        {},
        {
          sign: {
            sub: id,
          },
        }
      );

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
        return reply.status(401).send({ message: "Invalid credentials" });
      }
      throw error;
    }
  });
}
