import { PrismaGymRepository } from "@/repositories/prisma/prisma-gym-repository";
import { SearchGymUseCase } from "../search-gym";

export function makeSearchGymsUseCase() {
    const gymRepository = new PrismaGymRepository()
    const searchUseCase = new SearchGymUseCase(gymRepository)

    return searchUseCase
}