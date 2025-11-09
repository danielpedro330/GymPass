import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { InMemoryCheckInRepository } from '@/repositories/in-memory/in-memory-check-in-repository';
import { FetchUserCheckInHistoryUseCase } from './fetch-user-check-in-history';

let checkInRepository: InMemoryCheckInRepository;
let sut: FetchUserCheckInHistoryUseCase;

describe('Fetch User Check-in History Use Cases', () => {
    beforeAll(() => {
        checkInRepository = new InMemoryCheckInRepository()
        sut = new FetchUserCheckInHistoryUseCase(checkInRepository)
    })

    it('Should be able to fetch check-in history', async () => {
        await checkInRepository.create({
            gym_id: 'Gym-1',
            user_id: 'User-1'
        })

        await checkInRepository.create({
            gym_id: 'Gym-2',
            user_id: 'User-1'
        })

        const {checkIns} = await sut.execute({
            user_id: 'User-1',
            page:1
        })

        expect(checkIns).toHaveLength(2)
        expect(checkIns).toEqual([
            expect.objectContaining({gym_id: 'Gym-1'}),
            expect.objectContaining({gym_id: 'Gym-2'}),
        ])

        checkInRepository.items.splice(0)
    })

    it('Should be able to fetch paginated check-in history', async () => {
       for(let i = 1; i <= 22; i++) {
        await checkInRepository.create({
            gym_id: `Gym-${i}`,
            user_id: 'User-1'
        })
       }

        const {checkIns} = await sut.execute({
            user_id: 'User-1',
            page: 2
        })

        expect(checkIns).toHaveLength(2)
        expect(checkIns).toEqual([
            expect.objectContaining({gym_id: 'Gym-21'}),
            expect.objectContaining({gym_id: 'Gym-22'}),
        ])
    })
})