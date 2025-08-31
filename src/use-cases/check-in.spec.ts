import { InMemoryCheckInRepository } from "@/repositories/in-memory/in-memory-check-in-repository"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CheckInUseCases } from "./check-in";
import { InMemoryGymRepository } from "@/repositories/in-memory/in-memory-gym-repository";
import { Decimal } from "@prisma/client/runtime/library";
import { MaxDistaceError } from "./errors/max-distance-error";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ns";

let registeruserCase: InMemoryCheckInRepository;
let gymRepository: InMemoryGymRepository;
let sut: CheckInUseCases;

describe('Check-in use case', () => {
    beforeEach(async () => {
        registeruserCase = new InMemoryCheckInRepository()
        gymRepository = new InMemoryGymRepository()
        sut = new CheckInUseCases(registeruserCase, gymRepository)

        vi.useFakeTimers()

        await gymRepository.create({
            id: 'gym-1',
            title: 'JavaScript gym',
            description: '',
            phone: '',
            latitude: new Decimal(-27.2092052),
            longitude: new Decimal(-49.6401091)
        })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('Should be able to check in', async () => {
        const {checkIn} = await sut.execute({
            gym_id: 'gym-1',
            user_id: 'user-1',
            userLatitude: -27.2092052,
            userLongitude: -49.6401091
        })

        expect(checkIn.id).toEqual(expect.any(String))
    })

    it('Should not be able to check in some on day', async () => {
        vi.setSystemTime(new Date(2000, 0, 22, 8, 0, 0))

        await sut.execute({
            gym_id: 'gym-1',
            user_id: 'user-1',
            userLatitude: -27.2092052,
            userLongitude: -49.6401091
        })

        await expect(() => 
            sut.execute({
                user_id: 'user-1',
                gym_id: 'gym-1',
                userLatitude: -27.2092052,
                userLongitude: -49.6401091
            })
        ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
    })

    it('Should be able to check in twice but in different day', async () => {
        vi.setSystemTime(new Date(2000, 0, 22, 8, 0, 0))

        await sut.execute({
            gym_id: 'gym-1',
            user_id: 'user-1',
            userLatitude: -27.2092052,
            userLongitude: -49.6401091
        })

        vi.setSystemTime(new Date(2000, 0, 23, 8, 0, 0))

        const {checkIn} = await sut.execute({
                user_id: 'user-1',
                gym_id: 'gym-1',
                userLatitude: -27.2092052,
                userLongitude: -49.6401091
        })

        expect(checkIn.id).toEqual(expect.any(String))
        
    })

    it('Should not be able to check in on distant gym', async () => {
        gymRepository.items.push({
            id: 'gym-2',
            title: 'JavaScript gym',
            description: '',
            phone: '',
            latitude: new Decimal(-27.0747279),
            longitude: new Decimal(-49.4889672)
        }) 

        await expect(() => sut.execute({
            gym_id: 'gym-2',
            user_id: 'user-1',
            userLatitude: -27.2092052,
            userLongitude: -49.6401091
        })).rejects.toBeInstanceOf(MaxDistaceError)
    })

})