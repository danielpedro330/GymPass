import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { create } from "./create";
import { history } from "./history";
import { metrics } from "./metrics";
import { validate } from "./validate";

export function chekInRoutes(app: FastifyInstance) {
    app.addHook("onRequest", verifyJWT)

    app.post('/gyms/:gymId/check-ins', create)
    app.post('/gyms/:checkInId/validete', validate)

    app.get('/check-ins/history', history)
    app.get('/check-ins/metrics', metrics)
}