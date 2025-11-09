import { GetUserMetricsUseCase } from "../get-user-metrics";
import { PrismaCheckInsReposytory } from "@/repositories/prisma/prisma-ckeck-ins-repository";
import { ValidateUseCases } from "../validate-check-in";

export function makeValidateCheckInUseCase() {
    const checkInsRepository = new PrismaCheckInsReposytory()
    const useCase = new ValidateUseCases(checkInsRepository)

    return useCase
}