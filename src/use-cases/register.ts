import { prisma } from "@/lib/prisma"
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-user-repository"
import { UsersRepository } from "@/repositories/users-repositories"
import { hash } from "bcryptjs"
import { userAlreadyExistsError } from "./errors/user-already-exists-error"
import { User } from "@prisma/client"

interface RegisterUseCaseRequest {
    name: string,
    email: string,
    password: string
}

interface RegisterUseCaseResponse {
    user: User
}

export class RegisterUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute({ name, email, password }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {

    const password_hash = await hash(password, 6)

    const userWithSomeEmail = await this.usersRepository.findByEmail(email)

    if (userWithSomeEmail) {
        throw new userAlreadyExistsError()
    }

    const user = await this.usersRepository.create({
        name,
        email,
        password_hash
    })

    return {
        user,
    }
}

}