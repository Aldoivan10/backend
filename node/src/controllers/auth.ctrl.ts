import { NextFunction, Request, Response } from "express"
import { inject, injectable } from "inversify"
import { AT_TIME, RT_TIME, TK_OPT } from "../config"
import { Types } from "../containers/types"
import { AuthError } from "../models/error"
import { AuthService } from "../services/auth.svc"
import { singToken } from "../utils/token.util"

@injectable()
export class AuthController {
    constructor(@inject(Types.AuthService) private readonly svc: AuthService) {}

    public users(_: Request, res: Response) {
        res.json({ data: this.svc.availableUsers() })
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username } = req.body
            const user = this.svc.authenticate(username)

            if (!user) throw AuthError.auth()

            const accessToken = await singToken(user, AT_TIME)
            const refreshToken = await singToken(user, RT_TIME)

            res.cookie(`${user.name}_at`, accessToken, TK_OPT)
                .cookie(`${user.name}_rt`, refreshToken, TK_OPT)
                .json({
                    message: "Usuario autenticado",
                })
        } catch (err) {
            next(err)
        }
    }

    public async auth(req: Request, res: Response, next: NextFunction) {
        try {
            const { password } = req.body
            const user = req.user

            if (!user) throw AuthError.token()
            if (!user.admin) throw AuthError.rol()
            if (!this.svc.login(user, password)) throw AuthError.auth()

            const accessToken = await singToken(user, AT_TIME)
            const refreshToken = await singToken(user, RT_TIME)

            res.cookie(`${user.name}_at`, accessToken, TK_OPT)
                .cookie(`${user.name}_rt`, refreshToken, TK_OPT)
                .json({ message: "Sesión iniciada como administrador" })
        } catch (err) {
            next(err)
        }
    }

    public logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { username } = req.body
            res.clearCookie(`${username}_at`)
                .clearCookie(`${username}_rt`)
                .json({ message: "Sesión cerrada" })
        } catch (err) {
            next(err)
        }
    }
}
