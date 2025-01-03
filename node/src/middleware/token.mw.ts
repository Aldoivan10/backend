import { NextFunction, Request, Response } from "express"
import { JWTExpired } from "jose/errors"
import { AT_TIME, TK_OPT } from "../config"
import { AuthError } from "../model/error"
import { getTokens, getUser, singToken } from "../util/token.util"

export const tokenMW = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const [accessToken, refreshToken] = getTokens(req)
        if (!accessToken || !refreshToken) throw AuthError.token()
        let user: Maybe<UserToken> = undefined
        try {
            user = await getUser(accessToken)
        } catch (tokenError) {
            if (tokenError instanceof JWTExpired) {
                user = await getUser(refreshToken)
                const newToken = await singToken(user, AT_TIME)
                res.cookie(`${user!.name}_at`, newToken, TK_OPT)
            } else throw tokenError
        } finally {
            res.locals.user = user
            next()
        }
    } catch (err) {
        next(err)
    }
}

export const requireAdminMW = async (
    _: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user: Maybe<UserToken> = res.locals.user
        if (!user || !user.logged) throw AuthError.token()
        if (user.role !== "Administrador") throw AuthError.rol()
        next()
    } catch (err) {
        next(err)
    }
}
