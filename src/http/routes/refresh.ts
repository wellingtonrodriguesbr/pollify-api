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
        sameSite: "none",
        httpOnly: true,
      })
      .status(200)
      .send({ token });
  });
}
