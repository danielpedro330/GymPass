import { GymRepository } from "@/repositories/gym-repositories"
import { Gym } from "@prisma/client"

interface SearchGymUseCaseRequest {
    query: string
    page: number
}

interface SearchGymUseCaseResponse {
    gyms: Gym[]
}

export class SearchGymUseCase {
    constructor(private gymRepository: GymRepository) {}

    async execute({
            query,
            page
        }: SearchGymUseCaseRequest): Promise<SearchGymUseCaseResponse> {
        const gyms = await this.gymRepository.searchMany(query, page)

        return {
            gyms
        }
    }
}