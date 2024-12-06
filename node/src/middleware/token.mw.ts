import { NextFunction, Request, Response } from "express"
import { jwtVerify } from "jose"
import { TK_KEY } from "../config"
import { AuthError } from "../model/error"
import { getTokens } from "../util/util"

export const tokenMW = (req: Request, _: Response, next: NextFunction) => {
    try {
        const [accessToken, refreshToken] = getTokens(req)
        if (!accessToken || !refreshToken) throw AuthError.token()
        const data = jwtVerify(accessToken, new TextEncoder().encode(TK_KEY))
        console.log(data)
    } catch (err) {
        next(err)
    }
}
