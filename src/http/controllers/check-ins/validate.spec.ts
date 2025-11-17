import request from "supertest";
import { app } from "@/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user";
import { prisma } from "@/lib/prisma";

describe('Check-In Validate (e2e)', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('Should be able to validate a check-in', async () => {
        const {token} = await createAndAuthenticateUser(app)

        const user = await prisma.user.findFirstOrThrow()

        const gym = await prisma.gym.create({
            data: {
                title: 'JavaScript',
                description: "Some description",
                phone: "19999999",
                latitude: -27.2092052,
                longitude: -49.6401091
            }
        })

        let checkIn = await prisma.checkIn.create({
            data: {
                    gym_id: gym.id,
                    user_id: user.id,
                }
        })

        const response = await request(app.server).post(`/gyms/${checkIn.id}/validete`).set("Authorization", `Bearer ${token}`).send({
           checkInId: checkIn.id
        })

        expect(response.statusCode).toEqual(204)  
        
        checkIn = await prisma.checkIn.findUniqueOrThrow({
            where: {
                id: checkIn.id
            }
        })

        expect(checkIn.validated_at).toEqual(expect.any(Date))
    })
})