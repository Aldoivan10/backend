export const {
    PORT = 3000,
    HOST = "localhost",
    PASS_SALT = 1,
    TK_KEY,
    AT_TIME = "15m",
    RT_TIME = "1d",
    DB_PATH,
    TK_ALG = "HS256",
    TK_OPT = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        secure: process.env.NODE_ENV === "production",
    },
} = process.env as Env
