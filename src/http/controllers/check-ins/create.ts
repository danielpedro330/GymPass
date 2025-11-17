import { makeCheckInUseCase } from "@/use-cases/factories/make-check-in-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function create(request: FastifyRequest, reply: FastifyReply) {
    const createCheckInsParmsSchema = z.object({
        gymId: z.string().uuid(),
    })

    const createCheckInsBodySchema = z.object({
        latitude: z.number().refine(value => {
            return Math.abs(value) <= 90
        }),
        longitude: z.number().refine(value => {
            return Math.abs(value) <= 180
        })
    })

    const { gymId } = createCheckInsParmsSchema.parse(request.params)
    const { latitude, longitude} = createCheckInsBodySchema.parse(request.body)

    const checkInUseCase = makeCheckInUseCase()

    await checkInUseCase.execute({
         gym_id: gymId,
         user_id: request.user.sub,
         userLatitude: latitude,
         userLongitude: longitude
    })

    return reply.status(201).send()
}