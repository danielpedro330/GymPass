import { GymRepository } from "@/repositories/gym-repositories"
import { Gym } from "@prisma/client"

interface CreateGymUseCasesRequest {
    title: string
    description: string | null
    phone: string | null
    latitude: number
    longitude: number
}

interface CreateGymUseCasesResponse {
    gyms: Gym
}

export class CreateGymUseCase {
    constructor(private gymRepository: GymRepository) {

    }

    async execute({
        title,
        description,
        phone,
        latitude,
        longitude
    }: CreateGymUseCasesRequest): Promise<CreateGymUseCasesResponse> {
        const gyms = await this.gymRepository.create({
            title,
            description,
            phone,
            latitude,
            longitude
        })

        return {gyms}
    }
}