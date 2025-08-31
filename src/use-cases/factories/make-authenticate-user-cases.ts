import { PrismaUsersRepository } from "@/repositories/prisma/prisma-user-repository"
import { AuthenticateUserCases } from "../authenticate"

export function makeAuthenticateUsercase() {
    const usersRepository = new PrismaUsersRepository()
    const registerUseCase = new AuthenticateUserCases(usersRepository)

    return registerUseCase
}