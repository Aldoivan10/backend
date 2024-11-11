import { NextFunction, Request, Response, Router } from "express"
import { validationMW } from "../middleware/validationMW"
import { plural } from "../util/util"
import * as CodeVal from "../validations/catalogVal"
import * as GeneralVal from "../validations/generalVal"

const router = Router()
const root = "/:table(code|department|entity|unit)"

const catalogs: CatalogMap = {
    code: { item: "Código", table: "Codigo" },
    unit: { item: "Unidad", table: "Unidad" },
    entity: { item: "Entidad", table: "Entidad" },
    department: { item: "Departamento", table: "Departamento" },
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
        item: catalog.item,
        table: catalog.table,
        filter: `%${filter}%`,
    }
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
    validationMW(CodeVal.name),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, table, name, item } = getData(req)
            const lastID = await db.lastID(table)
            await db.insert(`INSERT INTO ${table} VALUES (?, ?)`, [
                lastID,
                name,
            ])
            res.status(201).send({
                message: `${item} agregado con éxito`,
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
            const { db, table, ids, item } = getData(req)
            const placeholders = ids.map((_) => "?").join(", ")
            await db.remove(
                `DELETE FROM ${table} WHERE id IN (${placeholders})`,
                ids
            )
            res.send({
                message: `${plural(item)} eliminados con éxito`,
            })
        } catch (err) {
            next(err)
        }
    }
)

// Actualizar nombre
router.patch(
    `${root}/:id(\\d+)`,
    validationMW(CodeVal.name),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { db, table, id, name, item } = getData(req)
            await db.query(`UPDATE ${table} SET nombre = ? WHERE id = ?`, [
                name,
                id,
            ])
            res.status(201).send({
                message: `${item} actualizado con éxito`,
                data: { id, name },
            })
        } catch (err) {
            next(err)
        }
    }
)

export default router
