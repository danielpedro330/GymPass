import request from "supertest"
import {app} from "@/app"
import { afterEach, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"

describe("Register (e2e)", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterEach(async () => {
        await app.close()

    })

    it("Should be able to register", async () => {
        const response = await request(app.server).post("/users").send({
            name: "John Doe",
            email: "jonh@example.com",
            password: "123456"
        })

        expect(response.statusCode).toEqual(201)
    })
})