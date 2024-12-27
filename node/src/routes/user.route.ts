import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response, Router } from "express"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { DBError } from "../models/error"
import { UserService } from "../services/user.svc"
import { getFilter } from "../utils/route.util"
import { IdsSchema } from "../validations/general.val"
import { ShortcutSchema } from "../validations/shortcut.val"
import { UserSchema } from "../validations/user.val"

const router = Router()
const svc = new UserService()

// Obtener todos
router.get("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter = getFilter(req, ["nombre", "role"])
        const data = svc.all(filter)
        res.json({ data })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por ID
router.get("/:id(\\d+)", (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id
        const user = svc.getByID(id)
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
    validationMW(ShortcutSchema),
    (
        req: Express.BodyRequest<typeof ShortcutSchema>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const user = req.user!
            const { shortcuts }: ShortcutsBody = req.body
            const changes = svc.shortcuts(user.id, shortcuts)
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
    validationMW(UserSchema),
    (
        req: Express.BodyRequest<typeof UserSchema>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const user = req.user!
            const data = svc.add(req.body, user.name)
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

// Actualizar
router.patch(
    "/:id(\\d+)",
    tokenMW,
    requireAdminMW,
    validationMW(UserSchema),
    (
        req: Express.BodyRequest<typeof UserSchema>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const id = +req.params.id!
            const user = req.user!
            const data = svc.edit(id, req.body, user.name)

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

// Eliminar
router.delete(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(IdsSchema),
    (req: Express.DeleteRequest, res: Response, next: NextFunction) => {
        try {
            const { ids } = req.body
            const user = req.user!
            const data = svc.remove(ids, user.name)
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

export default router
