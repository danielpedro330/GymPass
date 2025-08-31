import { Gym, Prisma } from "@prisma/client";
import { GymRepository } from "../gym-repositories";
import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/library";

export class InMemoryGymRepository implements GymRepository {
    
    public items: Gym[] = []

    async findById(id: string) {
        const items = await this.items.find((item) => item.id === id)

        if(!items) {
            return null
        }

        return items
    }

    async searchMany(query: string, page: number): Promise<Gym[]> {
        return this.items.filter((item) => item.title.includes(query)).slice((page - 1) * 20, page * 20)
    }

    async create(data: Prisma.GymCreateInput) {
    
        const gym = {
        id: data.id ?? randomUUID(),
        title: data.title,
        description: data.description ?? null,
        phone: data.phone ?? null,
        latitude: new Decimal(data.latitude.toString()),
        longitude: new Decimal(data.longitude.toString()),
        created_at: new Date()
    }

    this.items.push(gym)

    return gym
}}