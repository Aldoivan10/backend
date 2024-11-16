import { NextFunction, Request, Response, Router } from "express"
import { validationMW } from "../middleware/validationMW"
import { getBase } from "../util/util"
import { entityVal } from "../validations/entityVal"
import * as GeneralVal from "../validations/generalVal"

const router = Router()
const table = "Entidad"
const columns = [
    "id_entity_type",
    "rfc",
    "name",
    "address",
    "domicile",
    "postal_code",
    "phone",
    "email",
]

const getParams = (req: Request) => {
    const {
        rfc,
        name,
        phone,
        email,
        address,
        domicile,
        postal_code,
        id_entity_type,
    }: EntityBody = req.body

    return [
        id_entity_type,
        rfc,
        name,
        address,
        domicile,
        postal_code,
        phone,
        email,
    ]
}

// Obtener todos
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { db, limit, offset, filter } = getBase(req)
        const entitys = await db.all<Entity>(
            table,
            ["id", "nombre as name"],
            [`%${filter}%`, limit, offset]
        )
        res.json({ data: entitys })
    } catch (err) {
        next(err)
    }
})

// Obtener por ID
router.get(
    "/:id(\\d+)",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, id } = getBase(req)
            const entity = await db.getByID<Entity>(
                table,
                ["id", "nombre AS name"],
                id
            )
            res.json({ data: entity ?? null })
        } catch (err) {
            next(err)
        }
    }
)

// Insertar
router.post(
    "/",
    validationMW(entityVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db } = getBase(req)
            const params = getParams(req)
            const entity = await db.insert<Entity>(table, params, columns)
            res.status(201).json({
                message: "Entidad creada",
                data: entity,
            })
        } catch (err) {
            next(err)
        }
    }
)

// Eliminar
router.delete(
    "/",
    validationMW(GeneralVal.ids),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, ids } = getBase(req)
            const entitys = await db.delete<Entity>(table, ids, columns)
            res.send({ message: "Entidades eliminadas", data: entitys })
        } catch (err) {
            next(err)
        }
    }
)

// Actualizar
router.patch(
    "/:id(\\d+)",
    validationMW(entityVal),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, id } = getBase(req)
            const params = getParams(req)
            const entity = await db.update<Entity>(
                table,
                [
                    "id_tipo_entidad",
                    "rfc",
                    "nombre",
                    "direccion",
                    "domicilio",
                    "codigo_postal",
                    "telefono",
                    "correo",
                ],
                id,
                params,
                columns
            )

            if (entity)
                res.send({
                    message: "Entidad actualizada",
                    data: entity,
                })
            else
                res.send({
                    message: "No hubo modificaciones",
                    data: entity ?? null,
                })
        } catch (err) {
            next(err)
        }
    }
)

export default router
