import { CreateGymUseCase } from "../create-gym";
import { GetProfileUser } from "../get-user-profile";
import { PrismaGymRepository } from "@/repositories/prisma/prisma-gym-repository";

export function makeCreateGymUseCase() {
    const gymRepository = new PrismaGymRepository()
    const createGymUseCase = new CreateGymUseCase(gymRepository)

    return createGymUseCase
}