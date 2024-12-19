import { NextFunction, Request, Response, Router } from "express"
import { AT_TIME, RT_TIME, TK_OPT } from "../config"
import { tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { AuthError } from "../models/error"
import { AuthService } from "../services/auth.svc"
import { singToken } from "../utils/token.util"
import { adminVal, loginVal } from "../validations/login.val"

const router = Router()
const svc = new AuthService()

router.get("/users", (_, res) => {
    res.json({ data: svc.availableUsers() })
})

router.post(
    "/login",
    validationMW(loginVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username } = req.body
            const user = svc.authenticate(username)

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
)

router.post(
    "/login/admin",
    validationMW(adminVal),
    tokenMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { password }: LoginBody = req.body
            const user = res.locals.user

            if (!user) throw AuthError.token()
            if (user.role !== "Administrador") throw AuthError.rol()
            if (!svc.login(user, password)) throw AuthError.auth()

            const accessToken = await singToken(user, AT_TIME)
            const refreshToken = await singToken(user, RT_TIME)

            res.cookie(`${user.name}_at`, accessToken, TK_OPT)
                .cookie(`${user.name}_rt`, refreshToken, TK_OPT)
                .json({ message: "Sesión iniciada como administrador" })
        } catch (err) {
            next(err)
        }
    }
)

router.post(
    "/logout",
    validationMW(loginVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username }: LoginBody = req.body
            res.clearCookie(`${username}_at`)
                .clearCookie(`${username}_rt`)
                .json({ message: "Sesión cerrada" })
        } catch (err) {
            next(err)
        }
    }
)

export default router
