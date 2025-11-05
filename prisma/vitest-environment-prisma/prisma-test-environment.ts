import type { Environment } from "vitest/environments"

export default <Environment> {
    name: 'prisma',
    transformMode: 'ssr',
    setup(global, options) {
        console.log("setup")

        return {
            teardown(global) {
                console.log("teardown")
            },
        }
    },
}