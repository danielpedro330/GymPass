import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthenticateUserCases } from './authenticate'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository;
let sut: AuthenticateUserCases;

describe('Register authenticate', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new AuthenticateUserCases(usersRepository)
    })

    it('Should to able authenticate', async () => {
        
        await usersRepository.create({
            name: 'Marcks Brito',
            email: 'Marcos@gmail.com',
            password_hash: await hash('123456', 6)
        })

        const { user } = await sut.execute({
            email: 'Marcos@gmail.com',
            password: '123456'
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it('Should not to able authenticate with wrong password', async () => {
        
        await expect(() => 
             sut.execute({
                email: 'Marcos@gmail.com',
                password: '123456'
            })
        ).rejects.toBeInstanceOf(InvalidCredentialsError)
    })

     it('Should not to able authenticate with wrong password', async () => {

        await usersRepository.create({
            name: 'Marcks Brito',
            email: 'Marcos@gmail.com',
            password_hash: await hash('123456', 6)
        })

        await expect(() => 
            sut.execute({
                email: 'Marcos@gmail.com',
                password: '23456'
            })
        ).rejects.toBeInstanceOf(InvalidCredentialsError)
    })
})