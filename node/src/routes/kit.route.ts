import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response, Router } from "express"
import { requireAdminMW, tokenMW } from "../middleware/token.mw"
import { validationMW } from "../middleware/validation.mw"
import { DBError } from "../model/error"
import KitRepo from "../repositories/kit.repo"
import { getBase } from "../util/util"
import * as GeneralVal from "../validations/general.val"
import { KitVal } from "../validations/kit.val"

const router = Router()
const repo = new KitRepo()

router.get("/", (req, res, next) => {
    try {
        const { filter } = getBase(req)
        const data = repo.all(filter)
        res.json({ data })
    } catch (err: any) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

router.get("/:id(\\d+)", (req, res, next) => {
    try {
        const { id } = getBase(req)
        const data = repo.getByID(id)
        res.json({ data })
    } catch (err: any) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(KitVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const params: KitBody = req.body
            const kit = repo.insert(params)
            res.status(201).json({
                message: "Kit creado",
                data: kit,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }
)

router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(KitVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = getBase(req)
            const params: KitBody = req.body
            const kit = repo.update(id, params)

            res.send({
                message: kit ? "Kit actualizado" : "No hubo modificaciones",
                data: kit,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.update(err))
            else next(err)
        }
    }
)

router.delete(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(GeneralVal.ids),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ids } = getBase(req)
            const kits = repo.delete(ids)
            res.send({ message: "Kits eliminados", data: kits })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
)

export default router
