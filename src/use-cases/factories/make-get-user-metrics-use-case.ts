import { GetUserMetricsUseCase } from "../get-user-metrics";
import { PrismaCheckInsReposytory } from "@/repositories/prisma/prisma-ckeck-ins-repository";

export function makeGetUserMetricsUseCase() {
    const checkInsRepository = new PrismaCheckInsReposytory()
    const useCase = new GetUserMetricsUseCase(checkInsRepository)

    return useCase
}