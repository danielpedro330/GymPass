import { FetchUserCheckInHistoryUseCase } from "../fetch-user-check-in-history";
import { PrismaCheckInsReposytory } from "@/repositories/prisma/prisma-ckeck-ins-repository";

export function makeFetchUserCheckInsHistoryUseCase() {
    const checkInsRepository = new PrismaCheckInsReposytory()
    const useCase = new FetchUserCheckInHistoryUseCase(checkInsRepository)

    return useCase
}