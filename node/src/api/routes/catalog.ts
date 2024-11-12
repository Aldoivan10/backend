import { NextFunction, Request, Response, Router } from "express"
import { checkSchema } from "express-validator"
import { validationMW } from "../middleware/validationMW"
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
    const { limit = 10, offset = 0, filter = "" }: APIFilter = req.query
    const { name = "", ids = [] }: CatalogBody = req.body
    const { id, table }: CatalogParams = req.params
    const catalog = catalogs[table]
    const db = req.app.locals.db
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
        const query = `SELECT id, nombre AS name 
        FROM ${table} 
        WHERE nombre LIKE ? ORDER BY nombre
        LIMIT ? OFFSET ?`
        const codes = await db.fetch(query, [filter, limit, offset])
        res.json({ data: codes })
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
            const query = `SELECT id, nombre AS name FROM ${table} WHERE id = ?`
            const code = await db.get(query, [id])
            res.json({ data: code ?? null })
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
            const lastID = await db.lastID(table)
            await db.insert(`INSERT INTO ${table} VALUES (?, ?)`, [
                lastID,
                name,
            ])
            res.status(201).send({
                message: msgs.add,
                data: { id: lastID, name },
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
            const placeholders = ids.map((_) => "?").join(", ")
            await db.remove(
                `DELETE FROM ${table} WHERE id IN (${placeholders})`,
                ids
            )
            res.send({
                message: msgs.del,
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
            await db.query(`UPDATE ${table} SET nombre = ? WHERE id = ?`, [
                name,
                id,
            ])
            res.status(201).send({
                message: msgs.upd,
                data: { id, name },
            })
        } catch (err) {
            next(err)
        }
    }
)

export default router
