import { NextFunction, Request, Response, Router } from "express"
import { validationMW } from "../middleware/validationMW"
import { APIError } from "../model/error"
import { getBase } from "../util/util"
import { loginVal } from "../validations/loginVal"

const router = Router()

router.post(
    "/login",
    validationMW(loginVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db } = getBase(req)
            const { name, password }: LoginBody = req.body

            const user = await db.get(
                "SELECT nombre AS name, contrasenia AS password FROM Usuario WHERE nombre = ?",
                [name]
            )

            if (!user)
                throw new APIError({
                    message: "El usuario no existe",
                    status: 401,
                })
        } catch (err) {
            next(err)
        }
    }
)

router.post("/logout", (req, res) => {})

export default router
