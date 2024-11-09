import { NextFunction, Request, Response, Router } from "express"
import { validationHandler } from "../middleware/valmid"
import { APIError } from "../util/errors"
import { getError } from "../util/logger"
import * as Validation from "../validations/codeval"

const router = Router()
const item = "código"
const table = "Codigo"

router.post(
    "/",
    validationHandler({ schema: Validation.name, item }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const db = req.app.locals.db
            const lastID = await db.lastID(table)
            res.send(lastID)
        } catch (err: any) {
            if (err instanceof APIError) next(err)
            else next(getError(err, "route"))
        }
    }
)

export default router
