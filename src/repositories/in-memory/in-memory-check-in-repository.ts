import { Prisma, CheckIn } from "@prisma/client";
import { CheckInRepository } from "../check-in-respository";
import { randomUUID } from "node:crypto";
import dayjs from "dayjs";

export class InMemoryCheckInRepository implements CheckInRepository {
    public items: CheckIn[] = []

    async findById(id: string) {
        const checkIn = await this.items.find(item => item.id === id)

        if(!checkIn) {
            return null
        }
        
        return checkIn
    }

    
    async findByUserIdOnDate(userId: string, date: Date) {
        const startOfDate = dayjs(date).startOf('date')
        const endOfDate = dayjs(date).endOf('date')

        const CheckInOnSomeDay = await this.items.find((checkIn) =>{
            const InputDate = dayjs(checkIn.created_at)
            const isOnSomeDate = dayjs(InputDate).isAfter(startOfDate) && dayjs(InputDate).isBefore(endOfDate)


            return checkIn.user_id === userId && isOnSomeDate
        })

        if(!CheckInOnSomeDay) {
            return null
        }
    
        return CheckInOnSomeDay
    }

    async findManyByUserId(userId: string, page: number) {
        return this.items
            .filter(item => item.user_id === userId)
            .slice((page - 1) * 20 , page * 20)
    }

    async countByUserId(userId: string): Promise<number> {
        return this.items
            .filter(item => item.user_id == userId)
            .length
    }

    async create(data: Prisma.CheckInUncheckedCreateInput) {
        const checkIn = {
            id: randomUUID(),
            gym_id: data.gym_id,
            user_id: data.user_id,
            created_at: new Date(),
            validated_at: data.validated_at ? new Date(data.validated_at) : null
        }

        this.items.push(checkIn)

        return checkIn
    }

    async save(checkIn: CheckIn) {
        const checkInIndex = this.items.findIndex(item => item.id === checkIn.id)

        if (checkInIndex >= 0) {
            this.items[checkInIndex] = checkIn
        }

        return checkIn
    }

}