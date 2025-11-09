import request from "supertest";
import { app } from "@/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe('Create Gym (e2e)', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('Should be able to create gym', async () => {
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

        const response = await request(app.server).post('/gym').set("Authorization", `Bearer ${token}`).send({
            title: 'JavaScript',
            description: "aaaaaaa",
            phone: "9999999",
            latitude: -27.2092052,
            longitude: -49.6401091
        })
        console.log(response.statusCode, response.body)


        expect(response.statusCode).toEqual(201)
    })
})