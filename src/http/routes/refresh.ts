import dayjs from "dayjs";
import { FastifyInstance } from "fastify";

export async function refresh(app: FastifyInstance) {
  app.patch("/token/refresh", async (req, reply) => {
    await req.jwtVerify({ onlyCookie: true });

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: req.user.sub,
          expiresIn: "10m",
        },
      }
    );

    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: req.user.sub,
        },
      }
    );

    reply
      .setCookie("refreshToken", refreshToken, {
        path: "/",
        secure: true,
        sameSite: true,
        domain: process.env.COOKIES_DOMAIN,
        httpOnly: true,
        expires: dayjs().add(7, "day").toDate(),
      })
      .status(200)
      .send({ token });
  });
}
