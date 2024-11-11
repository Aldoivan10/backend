import { NextFunction, Request, Response, Router } from "express"
import { validationMW } from "../middleware/validationMW"
import * as Validation from "../validations/codeVal"

const router = Router()
const item = "código"
const table = "Codigo"

// Obtener todos los códigos
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 10, offset = 0, filter = "" }: APIFilter = req.query
        const db = req.app.locals.db
        const query = `SELECT id, nombre AS name 
        FROM ${table} 
        WHERE nombre LIKE ? ORDER BY nombre
        LIMIT ? OFFSET ?`
        const codes = await db.fetch(query, [`%${filter}%`, limit, offset])
        res.json({ data: codes })
    } catch (err) {
        next(err)
    }
})

// Obtener por ID
router.get(
    "/:id(\\d+)",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const db = req.app.locals.db
            const { id } = req.params
            const query = `SELECT id, nombre AS name FROM ${table} WHERE id = ?`
            const code = await db.get(query, [id])
            res.json({ data: code ?? null })
        } catch (err) {
            next(err)
        }
    }
)

// Crear nuevo código
router.post(
    "/",
    validationMW({ schema: Validation.name, item }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const db = req.app.locals.db
            const name = req.body.name
            const lastID = await db.lastID(table)
            await db.insert(`INSERT INTO ${table} VALUES (?, ?)`, [
                lastID,
                name,
            ])
            res.status(201).send({
                message: "Código agregado con éxito",
                data: { id: lastID, name },
            })
        } catch (err) {
            next(err)
        }
    }
)

// Eliminar códigos
router.delete(
    "/",
    validationMW({ schema: Validation.ids, item }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const db = req.app.locals.db
            const ids: number[] = req.body.ids
            const placeholders = ids.map((_) => "?").join(", ")
            await db.remove(
                `DELETE FROM ${table} WHERE id IN (${placeholders})`,
                ids
            )
            res.send({
                message: "Códigos eliminados con éxito",
            })
        } catch (err) {
            next(err)
        }
    }
)

// Actualizar nombre del código
router.patch(
    "/:id(\\d+)",
    validationMW({ schema: Validation.name, item }),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const db = req.app.locals.db
            const name = req.body.name
            const id = +req.params.id
            await db.query(`UPDATE ${table} SET nombre = ? WHERE id = ?`, [
                name,
                id,
            ])
            res.status(201).send({
                message: "Código actualizado con éxito",
                data: { id, name },
            })
        } catch (err) {
            next(err)
        }
    }
)

export default router
