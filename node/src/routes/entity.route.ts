import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response, Router } from "express"
import { validationMW } from "../middleware/validation.mw"
import { DBError } from "../model/error"
import EntityRepository from "../repositories/entity.repo"
import { getBase } from "../util/util"
import { entityVal } from "../validations/entity.val"
import * as GeneralVal from "../validations/general.val"

const router = Router()
const repo = new EntityRepository()

// Obtener todos
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { filter } = getBase(req)
        const entitys = repo.all(filter)
        res.json({ data: entitys })
    } catch (err: any) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por ID
router.get(
    "/:id(\\d+)",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = getBase(req)
            const entity = repo.getByID(id)
            res.json({ data: entity })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }
)

// Insertar
router.post(
    "/",
    validationMW(entityVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params: Entity = req.body
            const entity = repo.insert(params)
            res.status(201).json({
                message: "Entidad creada",
                data: entity,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }
)

// Eliminar
router.delete(
    "/",
    validationMW(GeneralVal.ids),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ids } = getBase(req)
            const entitys = repo.delete(ids)
            res.send({ message: "Entidades eliminadas", data: entitys })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
)

// Actualizar
router.patch(
    "/:id(\\d+)",
    validationMW(entityVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = getBase(req)
            const params: Entity = req.body
            const entity = repo.update(id, params)

            res.send({
                message: entity
                    ? "Entidad actualizada"
                    : "No hubo modificaciones",
                data: entity,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.update(err))
            else next(err)
        }
    }
)

export default router
