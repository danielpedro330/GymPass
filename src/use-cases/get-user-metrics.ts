import { CheckInRepository } from "@/repositories/check-in-respository";

interface GetUserMetricsUseCaseResquest {
    userId: string
}

interface GetUserMetricsUseCaseResponse {
    checkInCount: number
}

export class GetUserMetricsUseCase {
    constructor(private checkInRepository: CheckInRepository) {}

    async execute({userId}: GetUserMetricsUseCaseResquest): Promise<GetUserMetricsUseCaseResponse> {
        const checkInCount = await this.checkInRepository.countByUserId(userId)

        return {
            checkInCount
        }
    }
}