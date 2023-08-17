export const setting_env = {
    MONGO_URL: process.env.MONGO_URL ?? ' ',
    JWT_SECRET: process.env.JWT_SECRET ?? '123',
    JWT_ACCESS_EXP: process.env.JWT_ACCESS_EXP ?? '5m',
    JWT_REFRESH_EXP: process.env.JWT_REFRESH_EXP ?? '5m',

    TTL: process.env.TTL ?? 10,
    LIMIT: process.env.LIMIT ?? 5,

    EMAIL: process.env.EMAIL ?? ' ',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ?? '  '
}
