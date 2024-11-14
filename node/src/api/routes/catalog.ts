import { NextFunction, Request, Response, Router } from "express"
import { checkSchema } from "express-validator"
import { validationMW } from "../middleware/validationMW"
import { getBase } from "../util/util"
import catalogVal from "../validations/catalogVal"
import * as GeneralVal from "../validations/generalVal"

const router = Router()
const root = "/:table(code|department|entity_type|unit)"

const catalogs: CatalogMap = {
    code: {
        msgs: {
            del: "Códigos eliminados",
            add: "Código agregado",
            upd: "Código actaualizado",
        },
        table: "Codigo",
    },
    unit: {
        msgs: {
            del: "Unidades eliminadas",
            add: "Unidad agregada",
            upd: "Unidad actualizada",
        },
        table: "Unidad",
    },
    entity_type: {
        msgs: {
            add: "Tipo agregado",
            del: "Tipos eliminados",
            upd: "Tipo actualizado",
        },
        table: "Tipo_Entidad",
    },
    department: {
        msgs: {
            add: "Departamento agregado",
            del: "Departamentos eliminados",
            upd: "Departamento actualizado",
        },
        table: "Departamento",
    },
}

function getData(req: Request) {
    const { db, limit, offset, filter, ids } = getBase(req)
    const { name = "" }: CatalogBody = req.body
    const { id, table }: CatalogParams = req.params
    const catalog = catalogs[table]
    return {
        db,
        ids,
        name,
        limit,
        offset,
        id: +id,
        msgs: catalog.msgs,
        table: catalog.table,
        filter: `%${filter}%`,
    }
}

async function check(req: Request, _: Response, next: NextFunction) {
    const { table } = req.params
    const schema = catalogVal[table]
    await checkSchema(schema).run(req)
    next()
}

// Obtener todos
router.get(root, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { db, limit, offset, filter, table } = getData(req)
        const items = await db.all<Entity>(
            table,
            ["id", "nombre AS name"],
            [`%${filter}%`, limit, offset]
        )
        res.json({ data: items })
    } catch (err) {
        next(err)
    }
})

// Obtener por ID
router.get(
    `${root}/:id(\\d+)`,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, id, table } = getData(req)
            const item = await db.getByID<CatalogItem>(
                table,
                ["id", "nombre AS name"],
                id
            )
            res.json({ data: item ?? null })
        } catch (err) {
            next(err)
        }
    }
)

// Crear nuevo
router.post(
    root,
    validationMW(check),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, table, name, msgs } = getData(req)
            const item = await db.insert<CatalogItem>(table, [name])
            res.status(201).send({
                message: msgs.add,
                data: item,
            })
        } catch (err) {
            next(err)
        }
    }
)

// Eliminar
router.delete(
    root,
    validationMW(GeneralVal.ids),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, table, ids, msgs } = getData(req)
            const items = await db.delete<CatalogItem>(table, ids)
            res.send({
                message: msgs.del,
                data: items,
            })
        } catch (err) {
            next(err)
        }
    }
)

// Actualizar nombre
router.patch(
    `${root}/:id(\\d+)`,
    validationMW(check),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, table, id, name, msgs } = getData(req)
            const item = await db.update<CatalogItem>(table, ["nombre"], id, [
                name,
            ])
            if (item)
                res.json({
                    message: msgs.upd,
                    data: item,
                })
            else
                res.json({
                    message: "No hubo modificaciones",
                    data: item ?? null,
                })
        } catch (err) {
            next(err)
        }
    }
)

export default router
