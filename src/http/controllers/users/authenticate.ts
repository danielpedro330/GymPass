import z from "zod"
import {FastifyRequest, FastifyReply} from "fastify"
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error"
import { makeAuthenticateUsercase } from "@/use-cases/factories/make-authenticate-user-case"

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })

    const { email, password } = registerBodySchema.parse(request.body)

    try{
        const authenticateUseCase = makeAuthenticateUsercase()

        const {user} = await authenticateUseCase.execute ({
            email,
            password
        })

        const token = await reply.jwtSign({
            role: user.role
        }, {
            sign: {
                sub: user.id
            }
        })

        const refreshToken = await reply.jwtSign({
            role: user.role
        }, {
            sign: {
                sub: user.id,
                expiresIn: '7d'
            }
        })

        return reply
        .setCookie('refreshToken', refreshToken, {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: true
        })  
        .status(200)
        .send({token})

    } catch(err) {
        if(err instanceof InvalidCredentialsError) {

            return reply.status(400).send({ message: err.message })
        }

        throw err
    }

}