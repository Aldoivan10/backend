import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response, Router } from "express"
import { requireAdminMW, tokenMW } from "../middleware/token.mw"
import { validationMW } from "../middleware/validation.mw"
import { DBError } from "../model/error"
import UserRepo from "../repositories/user.repo"
import { getBase } from "../util/util"
import * as GeneralVal from "../validations/general.val"
import { shortcutVal } from "../validations/shortcut.val"
import { userVal } from "../validations/user.val"

const router = Router()
const repo = new UserRepo()

// Obtener todos
router.get("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        const { filter } = getBase(req)
        const data = repo.all(filter)
        res.json({ data })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por ID
router.get("/:id(\\d+)", (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = getBase(req)
        const user = repo.getByID(id)
        res.json({ data: user })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Cambiar shortcuts
router.patch(
    "/shortcuts",
    tokenMW,
    validationMW(shortcutVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.user
            const { shortcuts }: ShortcutsBody = req.body
            const changes = repo.shortcuts(user!.id, shortcuts)
            res.status(201).json({
                message: changes
                    ? "Se actualizaron los atajos"
                    : "No hubo cambios",
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }
)

// Agregar usuario
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(userVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const user: UserBody = req.body
            const data = repo.insert(user)
            res.status(201).json({
                message: "Usuario creado",
                data,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }
)

// Eliminar
router.delete(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(GeneralVal.ids),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ids } = getBase(req)
            const data = repo.delete(ids)
            res.send({
                message: "Usuarios eliminados",
                data,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
)

// Actualizar
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(userVal),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = getBase(req)
            const user: UserBody = req.body
            const data = repo.update(id, user)
            res.status(201).json({
                message: data
                    ? "Usuario actualizado"
                    : "No hubo modificaciones",
                data,
            })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.update(err))
            else next(err)
        }
    }
)

export default router
