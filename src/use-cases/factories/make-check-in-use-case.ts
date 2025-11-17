import { PrismaGymRepository } from "@/repositories/prisma/prisma-gym-repository";
import { CheckInUseCases } from "../check-in";
import { GetUserMetricsUseCase } from "../get-user-metrics";
import { PrismaCheckInsReposytory } from "@/repositories/prisma/prisma-ckeck-ins-repository";

export function makeCheckInUseCase() {
    const checkInsRepository = new PrismaCheckInsReposytory()
    const gymRepository = new PrismaGymRepository()
    const useCase = new CheckInUseCases(checkInsRepository, gymRepository)

    return useCase
}