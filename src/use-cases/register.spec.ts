import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { userAlreadyExistsError } from './errors/user-already-exists-error'


let usersRepository: InMemoryUsersRepository;
let registerUseCase: RegisterUseCase;

describe('Register Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        registerUseCase = new RegisterUseCase(usersRepository)
    })

    it('Should be able to register', async () => {

        const { user } = await registerUseCase.execute({
            name: 'John Doe',
            email: 'johndoe@gmail.com.br',
            password: '123456',
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it('Should hash user password upon registration', async () => {

        const { user } = await registerUseCase.execute({
            name: 'John Doe',
            email: 'johndoe@gmail.com.br',
            password: '123456',
        })

        const isPassWordCorrectlyHashed = await compare(
            '123456',
            user.password_hash
        )

        expect(isPassWordCorrectlyHashed).toBe(true)
    })

    it('Should not be able to register with same email twice', async () => {
        
        const email = 'johndoe@gmail.com.br'

        await registerUseCase.execute({
            name: 'John Doe',
            email,
            password: '123456',
        })

        await expect (() => registerUseCase.execute({
            name: 'John Doe',
            email,
            password: '123456',
        })).rejects.toBeInstanceOf(userAlreadyExistsError)
        
    })
})