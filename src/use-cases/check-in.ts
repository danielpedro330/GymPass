import { CheckIn } from "@prisma/client"
import { CheckInRepository } from "@/repositories/check-in-respository"
import { GymRepository } from "@/repositories/gym-repositories"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"
import { getDistanceBetweenCondinates } from "@/utils/get-distance-between-coordinates"
import { MaxDistaceError } from "./errors/max-distance-error"
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ns"

interface CheckInUserCasesRequest {
    user_id: string
    gym_id: string
    userLatitude: number
    userLongitude: number
}

interface CheckInUserCasesResponse {
    checkIn: CheckIn
}

export class CheckInUseCases {
    constructor (
        private checkInRepository: CheckInRepository,
        private gymRepository: GymRepository
    ) {}

    async execute({ user_id, gym_id, userLatitude, userLongitude }: CheckInUserCasesRequest): Promise<CheckInUserCasesResponse> {
        const gym = await this.gymRepository.findById(gym_id)

        if(!gym) {
            throw new ResourceNotFoundError()
        }

        const distance = getDistanceBetweenCondinates(
            {latitude: userLatitude, longitude: userLongitude},
            {
                latitude: gym.latitude.toNumber(),
                 longitude: gym.longitude.toNumber()
            }
        )

        const MAX_DISTANCE_IN_KILOMETERS = 0.1

        if(distance > MAX_DISTANCE_IN_KILOMETERS) {
            throw new MaxDistaceError()
        }

        const checkInOnSomeDate = await this.checkInRepository.findByUserIdOnDate(
            user_id,
            new Date()
        )

        if (checkInOnSomeDate) {
            throw new MaxNumberOfCheckInsError()
        }

        const checkIn = await this.checkInRepository.create({
            gym_id,
            user_id
        })

        return {
            checkIn,
        }
    }
}