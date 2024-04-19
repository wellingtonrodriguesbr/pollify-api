import { FastifyInstance } from "fastify";
import { verifyJWT } from "@/http/middlewares/verify-jwt";

import { registerController } from "./register-controller";
import { submitMagiclinkController } from "./submit-magic-link-controller";
import { authenticateController } from "./authenticate-controller";
import { getProfileController } from "./get-profile-controller";
import { refreshController } from "./refresh";
import { signOutController } from "./sign-out";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/users", registerController);
  app.post("/sessions", authenticateController);
  app.patch("/token/refresh", refreshController);
  app.post("/sign-out", signOutController);
  app.post("/sessions/submit-magic-link", submitMagiclinkController);

  app.get("/me", { onRequest: [verifyJWT] }, getProfileController);
}
1;
