import { InMemoryCheckInRepository } from "@/repositories/in-memory/in-memory-check-in-repository";
import { beforeEach, describe, expect, it } from "vitest";
import { GetUserMetricsUseCase } from "./get-user-metrics";

let checkInRepository: InMemoryCheckInRepository;
let sut: GetUserMetricsUseCase;

describe('Get User Metrics', () => {
    beforeEach(() => {
        checkInRepository = new InMemoryCheckInRepository()
        sut = new GetUserMetricsUseCase(checkInRepository)
    })

    it('Should be able to get check-ins count from metrics', async () => {
        await checkInRepository.create({
            gym_id: 'Gym-1',
            user_id: 'User-1'
        })

        await checkInRepository.create({
            gym_id: 'Gym-2',
            user_id: 'User-1'
        })

        const {checkInCount} = await sut.execute({
            userId: 'User-1'
        })

        expect(checkInCount).toEqual(2)
    })
})