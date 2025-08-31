import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gym-repository';
import { beforeAll, describe, expect, it } from 'vitest';
import { SearchGymUseCase } from './search-gym';

let gymRepository: InMemoryGymRepository;
let sut: SearchGymUseCase;

describe('Search Gym Use Case', () => {
    beforeAll(() => {
        gymRepository = new InMemoryGymRepository();
        sut = new SearchGymUseCase(gymRepository)
    })

    it('Should be able to search gym', async () => {
        await gymRepository.create({
            title: 'JavaScript Gym',
            description: null,
            phone: null,
            latitude: -27.2092052,
            longitude: -49.6401091
        })

        await gymRepository.create({
            title: 'TypeScript Gym',
            description: null,
            phone: null,
            latitude: -27.2092052,
            longitude: -49.6401091
        })

        const {gyms} = await sut.execute({
            query: 'JavaScript',
            page: 1
        })

        expect(gyms).toHaveLength(1)
        expect(gyms).toEqual([expect.objectContaining({ title: 'JavaScript Gym' })])

        gymRepository.items.splice(0)
    })

    it('Should be able to pagened search gym', async () => {
        for(let i = 1; i <= 22; i++) {
            await gymRepository.create({
            title: `JavaScript Gym ${i}`,
            description: null,
            phone: null,
            latitude: -27.2092052,
            longitude: -49.6401091
        })}
        
        const {gyms} = await sut.execute({
            query: 'JavaScript',
            page: 2
        })

        expect(gyms).toHaveLength(2)
        expect(gyms).toEqual([
            expect.objectContaining({ title: 'JavaScript Gym 21' }),
            expect.objectContaining({ title: 'JavaScript Gym 22' })
        ])

    })
})