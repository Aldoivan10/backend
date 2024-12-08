import { Request } from "express"
import { jwtVerify, SignJWT } from "jose"
import { TK_ALG, TK_KEY } from "../config"

const encoder = new TextEncoder()

// Funcion para obtener el usuario (payload)
export const getUser = async (token?: string) => {
    if (!token) return undefined
    const { payload } = await jwtVerify(token, encoder.encode(TK_KEY))
    return payload as Maybe<UserToken>
}

// Funcion para obtener el token
export const singToken = async (payload: any, time: string) => {
    const token = await new SignJWT(payload)
        .setExpirationTime(time)
        .setProtectedHeader({ alg: TK_ALG })
        .sign(encoder.encode(TK_KEY))
    return token
}

// Obtenemos los tokens de acceso
export const getTokens = (req: Request) => {
    const { username }: LoginBody = req.body
    const cookies = req.cookies
    return [cookies[`${username}_at`], cookies[`${username}_rt`]]
}
