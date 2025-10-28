import { PrismaUsersRepository } from "@/repositories/prisma/prisma-user-repository";
import { GetProfileUser } from "../get-user-profile";

export function makeGetUserProfileUseCase() {
    const usersRepository = new PrismaUsersRepository()
    const getUserProfileUseCase = new GetProfileUser(usersRepository)

    return getUserProfileUseCase
}