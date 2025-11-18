import request from "supertest"
import {app} from "@/app"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

describe("Refreh Token (e2e)", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()

    })

    it("Should be able to refreh a token", async () => {
        await request(app.server).post("/users").send({
            name: "John Doe",
            email: "jonh@example.com",
            password: "123456"
        })

        const authResponse = await request(app.server).post("/session").send({
            email: "jonh@example.com",
            password: "123456"
        })

        const cookies = authResponse.get('Set-Cookie')

        if(!cookies) {return ""}

         const response = await request(app.server).patch("/token/refresh").set('Cookie', cookies).send()

        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({
            token: expect.any(String)
        })
        expect(response.get("Set-Cookie")).toEqual([
            expect.stringContaining("refreshToken=")
        ])
})
})