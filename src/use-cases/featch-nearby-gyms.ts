import { GymRepository } from "@/repositories/gym-repositories"
import { Gym } from "@prisma/client"

interface FeatchNearbyGymsUseCaseRequest {
    userLatitude: number,
    userLongitude: number
}

interface FeatchNearbyGymsUseCaseResponse {
    gyms: Gym[]
}

export class FeatchNearbyGymsUseCase {
    constructor(private gymRepository: GymRepository) {}

    async execute({
            userLatitude,
            userLongitude
        }: FeatchNearbyGymsUseCaseRequest): Promise<FeatchNearbyGymsUseCaseResponse> {
        const gyms = await this.gymRepository.findManyNearby({ latitude: userLatitude, longitude: userLongitude})

        return {
            gyms
        }
    }
}