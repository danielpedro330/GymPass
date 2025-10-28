import { FastifyReply, FastifyRequest } from "fastify";

export function verifyJWT(request:FastifyRequest, reply: FastifyReply) {
    try{
        request.jwtVerify()
    } catch(err) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }
}