import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository'
import { beforeAll, describe, expect, it } from 'vitest'
import { CreateGymUseCase } from './create-gym';

let gymRepository: InMemoryGymRepository;
let sut: CreateGymUseCase;

describe('Create gym use cases', () => {
    beforeAll(() => {
        gymRepository = new InMemoryGymRepository()
        sut = new CreateGymUseCase(gymRepository)
        
    })

    it('Should be able to create gym', async () => {
        const gym = await sut.execute({
            title: 'JavaScript',
            description: null,
            phone: null,
            latitude: -27.2092052,
            longitude: -49.6401091
        })

        expect(gym.gyms.id).toEqual(expect.any(String))
    })
})