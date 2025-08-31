export class userAlreadyExistsError extends Error {
    constructor() {
        super('E-mail already exists.')
    }
}