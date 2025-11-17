import { FastifyInstance } from "fastify";
import request from "supertest";

export async function createAndAuthenticateUser(app: FastifyInstance) {
        await request(app.server).post("/users").send({
            name: "John Doe",
            email: "jonh@example.com",
            password: "123456"
        })

        const authResponse = await request(app.server).post("/session").send({
            email: "jonh@example.com",
            password: "123456"
        })

        const {token} = await authResponse.body

        return {
            token
        }
}