import { UsersRepository } from "@/repositories/users-repositories";
import { User } from "@prisma/client";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetProfileUserRequest {
    userId: string
}

interface GetProfileUserResponse {
    user: User
}

export class GetProfileUser {
    constructor(private usersReposytory: UsersRepository) {}

    async execute({ userId }: GetProfileUserRequest): Promise<GetProfileUserResponse> {
        const user = await this.usersReposytory.findById(userId)

        if (!user) {
            throw new ResourceNotFoundError()
        }

        return {
            user
        }
    }
}