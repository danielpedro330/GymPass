import { UsersRepository } from "@/repositories/users-repositories"
import { InvalidCredentialsError } from "./errors/invalid-credentials-error"
import { compare } from "bcryptjs"
import { User } from "@prisma/client"

interface AuthenticateUserCasesRequest {
    email: string
    password: string
}

interface AuthenticateUserCasesResponse {
    user: User
}

export class AuthenticateUserCases {
    constructor (private userRepository: UsersRepository) {}

    async execute({ email, password }: AuthenticateUserCasesRequest): Promise<AuthenticateUserCasesResponse> {
        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw new InvalidCredentialsError()
        }
        
        const doesPasswordMatches = await compare(password, user.password_hash)

        if (!doesPasswordMatches) {
            throw new InvalidCredentialsError()
        }

        return {
            user,
        }
    }
}