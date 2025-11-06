import "dotenv/config"
import { randomUUID } from "node:crypto"
import { execSync } from "node:child_process"
import { URL } from "node:url"
import type { Environment } from "vitest/environments"
import { prisma } from "@/lib/prisma"

function generateDatabaseURL(schema: string) {
    if (!process.env.DATABASE_URL) {
        throw new Error("Please provide a DataBase_URL environment variable")
    }

    const url = new URL(process.env.DATABASE_URL)

    url.searchParams.set("schema", schema)

    return url.toString()
}

export default <Environment> {
    name: 'prisma',
    transformMode: 'ssr',
    async setup(global, options) {
        const schema = randomUUID()
        
        const database = generateDatabaseURL(schema)

        process.env.DATABASE_URL = database

        execSync('npx prisma migrate deploy')

        return {
            async teardown(global) {
                await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)

                await prisma.$disconnect()
            },
        }
    },
}