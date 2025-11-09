import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository';
import { beforeAll, describe, expect, it } from 'vitest';
import { FeatchNearbyGymsUseCase } from './featch-nearby-gyms';

let gymRepository: InMemoryGymRepository;
let sut: FeatchNearbyGymsUseCase;

describe('Search Gym Use Case', () => {
    beforeAll(() => {
        gymRepository = new InMemoryGymRepository();
        sut = new FeatchNearbyGymsUseCase(gymRepository)
    })

    it('Should be able to search gym', async () => {
        await gymRepository.create({
            title: 'Near Gym',
            description: null,
            phone: null,
            latitude: -27.2092052,
            longitude: -49.6401091
        })

        await gymRepository.create({
            title: 'Far  Gym',
            description: null,
            phone: null,
            latitude: -27.0610928,
            longitude: -49.5229501,
        })

        const {gyms} = await sut.execute({
            userLatitude: -27.2092052,
            userLongitude: -49.6401091
        })

        expect(gyms).toHaveLength(1)
        expect(gyms).toEqual([expect.objectContaining({ title: 'Near Gym' })])

        gymRepository.items.splice(0)
    })
})