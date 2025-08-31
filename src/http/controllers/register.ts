import { prisma } from "@/lib/prisma"
import z from "zod"
import { hash } from "bcryptjs"
import {FastifyRequest, FastifyReply} from "fastify"
import { RegisterUseCase } from "@/use-cases/register"
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-user-repository"
import { userAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error"
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-user-cases"

export async function register(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6)
    })

    const {name, email, password} = registerBodySchema.parse(request.body)

    try{
        
        const registerUseCase =  makeRegisterUseCase();

        await registerUseCase.execute ({
            name,
            email,
            password
        })
    } catch(err) {
        if(err instanceof userAlreadyExistsError) {

            return reply.status(409).send({ message: err.message })
        }

        throw err
    }

    return reply.status(201).send()
}