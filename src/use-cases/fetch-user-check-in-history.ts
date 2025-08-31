import { CheckIn } from "@prisma/client"
import { CheckInRepository } from "@/repositories/check-in-respository"

interface FetchUserCheckInHistoryUseCaseRequest {
    user_id: string
    page: number
}

interface FetchUserCheckInHistoryUseCaseResponse {
    checkIns: CheckIn[]
}

export class FetchUserCheckInHistoryUseCase {
    constructor (
        private checkInRepository: CheckInRepository,
    ) {}

    async execute({ user_id, page }: FetchUserCheckInHistoryUseCaseRequest): Promise<FetchUserCheckInHistoryUseCaseResponse> {
        const checkIns = await this.checkInRepository.findManyByUserId(user_id, page)

        return {
            checkIns,
        }
    }
}