import { PrismaGymRepository } from "@/repositories/prisma/prisma-gym-repository";
import { FeatchNearbyGymsUseCase } from "../featch-nearby-gyms";

export function makeFetchNearbyGymsUseCase() {
    const gymRepository = new PrismaGymRepository()
    const fetchNearbyGym = new FeatchNearbyGymsUseCase(gymRepository)

    return fetchNearbyGym
}