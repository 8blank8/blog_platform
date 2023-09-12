export const createUserDto = (number: number) => {
    return {
        login: `user${number}`,
        email: `user${number}@mail.com`,
        password: `password${number}`
    }
}