import request from "supertest"
import {app} from "@/app"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"

describe("Authenticate (e2e)", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
        await prisma.$disconnect()
    })

    it("Should be able to authenticate", async () => {
        await request(app.server).post("/users").send({
            name: "John Doe",
            email: "jonh@example.com",
            password: "123456"
        })

        const response = await request(app.server).post("/session").send({
            email: "jonh@example.com",
            password: "123456"
        })

        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({
            token: expect.any(String)
        })
})
})