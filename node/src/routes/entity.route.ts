import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response, Router } from "express"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { DBError } from "../models/error"
import { EntityService } from "../services/entity.svc"
import { getFilter } from "../utils/route.util"
import { EntitySchema } from "../validations/entity.val"
import { IdsSchema } from "../validations/general.val"

const router = Router()
const svc = new EntityService()
const columns = [
    "nombre",
    "tipo",
    "rfc",
    "dirección",
    "domicilio",
    "codigo_postal",
    "telefono",
    "correo",
]

// Obtener todos
router.get("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter = getFilter(req, columns)
        const entitys = svc.all(filter)
        res.json({ data: entitys })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por ID
router.get("/:id(\\d+)", (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id
        const entity = svc.getByID(id)
        res.json({ data: entity })
    } catch (err) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Insertar
router.post(
    "/",
    tokenMW,
    requireAdminMW,
    validationMW(EntitySchema),
    (
        req: Express.BodyRequest<typeof EntitySchema>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const user = req.user!
            const entity = svc.add(req.body, user.name)
            res.status(201).json({
                message: "Entidad creada",
                data: entity,
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
    validationMW(EntitySchema),
    (
        req: Express.BodyRequest<typeof EntitySchema>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const id = +req.params.id!
            const user = req.user!
            const entity = svc.edit(id, req.body, user.name)

            res.send({
                message: entity
                    ? "Entidad actualizada"
                    : "No hubo modificaciones",
                data: entity,
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
            const entitys = svc.remove(ids, user.name)
            res.send({ message: "Entidades eliminadas", data: entitys })
        } catch (err) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
)

export default router
