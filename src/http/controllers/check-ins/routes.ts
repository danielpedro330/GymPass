import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { create } from "./create";
import { history } from "./history";
import { metrics } from "./metrics";
import { validate } from "./validate";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";

export function chekInRoutes(app: FastifyInstance) {
    app.addHook("onRequest", verifyJWT)

    app.get('/check-ins/history', history)
    app.get('/check-ins/metrics', metrics)

    app.post('/gyms/:gymId/check-ins', create)

    app.patch('/gyms/:checkInId/validete', { onRequest: [verifyUserRole("ADMIN")] }, validate)
}