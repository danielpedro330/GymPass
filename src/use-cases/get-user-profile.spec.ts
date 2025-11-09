import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { beforeEach, describe, expect, it } from "vitest";
import { GetProfileUseCase } from "./get-user-profile";
import { hash } from "bcryptjs";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let userRegister: InMemoryUsersRepository;
let sut: GetProfileUseCase;

describe('Get user profile use case', () => {
    beforeEach(() => {
        userRegister = new InMemoryUsersRepository()
        sut = new GetProfileUseCase(userRegister)
    })

    it('Should be able to perfile',  async () => {

        const createdUser = await userRegister.create({
            name: 'Diego Doe',
            email: 'diego@gmail.com',
            password_hash: await hash('123456', 6)
        })

        const {user} = await sut.execute({
            userId: createdUser.id 
        })

        expect(user.name).toEqual('Diego Doe')
        
    })

    it('Should not be able to perfile with wrong id', async () => { 

        await expect(() => sut.execute({
            userId: 'non-existing-id'
        })).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
})