import request from "supertest"
import {app} from "@/app"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"

describe("Profile (e2e)", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
        await prisma.$disconnect()
    })

    it("Should be able to get user profile", async () => {
        await request(app.server).post("/users").send({
            name: "John Doe",
            email: "jonh@example.com",
            password: "123456"
        })

        const authResponse = await request(app.server).post("/session").send({
            email: "jonh@example.com",
            password: "123456"
        })

        const {token} = authResponse.body
        console.log(token)

        const profileResponse = await request(app.server).get("/me").set("Authorization", `Bearer ${token}`).send()
        console.log("📦 profileResponse status:", profileResponse.statusCode);

        expect(profileResponse.statusCode).toEqual(200)
    }, 20000)
})