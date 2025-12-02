import request from "supertest"
import {app} from "@/app"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user"

describe("Nearby Gym (e2e)", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
        await prisma.$disconnect()
    })

    it("Should be able to nearby a gym", async () => {
        const {token} = await createAndAuthenticateUser(app, true)

        await request(app.server).post('/gyms').set("Authorization", `Bearer ${token}`).send({
            title: 'JavaScript',
            description: "Some description",
            phone: "19999999",
            latitude: -27.2092052,
            longitude: -49.6401091
        })

        await request(app.server).post('/gym').set("Authorization", `Bearer ${token}`).send({
            title: 'TypeScript',
            description: "Some description",
            phone: "19999999",
            latitude: -27.0610928,
            longitude: -49.5229501
        })

        const response = await request(app.server).get("/gyms/nearby").query({
            latitude: -27.2092052,
            longitude: -49.6401091 }).set("Authorization", `Bearer ${token}`).send()

        expect(response.statusCode).toEqual(200)
        expect(response.body.gyms).toHaveLength(1)
        expect(response.body.gyms).toEqual([expect.objectContaining({
            title: "JavaScript"
        })])
    }, 20000)
})