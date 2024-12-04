export const {
    PORT = 3000,
    HOST = "localhost",
    PASS_SALT = 1,
    TK_KEY,
    AT_TIME = "15m",
    RT_TIME = "1d",
    DB_PATH,
} = process.env as Env
