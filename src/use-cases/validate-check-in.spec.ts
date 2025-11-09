import { InMemoryCheckInRepository } from "@/repositories/in-memory/in-memory-check-in-repository"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { ValidateUseCases } from "./validate-check-in";

let checkInRepository: InMemoryCheckInRepository;
let sut: ValidateUseCases;

describe('Validate check-in use case', () => {
    beforeEach(async () => {
        checkInRepository = new InMemoryCheckInRepository()
        sut = new ValidateUseCases(checkInRepository)

        //vi.useFakeTimers()
 
    })

    afterEach(() => {
        //vi.useRealTimers()
    })

    it('Should be able to validate the check in', async () => {
        const createdCheckIn = await checkInRepository.create({
            gym_id: 'gym-01',
            user_id: 'user-01'
        })

        const {checkIn} = await sut.execute({
            checkInId: createdCheckIn.id
        })

        expect(checkIn.validated_at).toEqual(expect.any(Date))
        expect(checkInRepository.items[0].validated_at).toEqual(expect.any(Date))
    })

    it('Should not be able to validate an inexistent check in', async () => {
        await expect(() => {
            sut.execute({
                checkInId: 'inexistent-check-in-id'
            })
        })
    })
})