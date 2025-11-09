import { CheckIn } from "@prisma/client"
import { CheckInRepository } from "@/repositories/check-in-respository"
import { GymRepository } from "@/repositories/gym-repositories"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"
import { getDistanceBetweenCondinates } from "@/utils/get-distance-between-coordinates"
import { MaxDistaceError } from "./errors/max-distance-error"
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ns"

interface ValidateCasesRequest {
    checkInId: string
}

interface ValidateCasesResponse {
    checkIn: CheckIn
}

export class ValidateUseCases {
    constructor (
        private checkInRepository: CheckInRepository,
    ) {}

    async execute({ checkInId }: ValidateCasesRequest): Promise<ValidateCasesResponse> {
        const checkIn = await this.checkInRepository.findById(checkInId)

        if(!checkIn) {
            throw new ResourceNotFoundError()
        }

        checkIn.validated_at = new Date()

        await this.checkInRepository.save(checkIn)

        return {
            checkIn,
        }
    }
}