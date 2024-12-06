import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response, Router } from "express"
import { checkSchema } from "express-validator"
import { validationMW } from "../middleware/validation.mw"
import { DBError } from "../model/error"
import CatalogRepository from "../repositories/catalog.repo"
import { getBase } from "../util/util"
import catalogVal from "../validations/catalog.val"
import * as GeneralVal from "../validations/general.val"

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
    user_type: {
        msgs: {
            add: "Tipo de usuario agregado",
            del: "Tipos de usuario eliminados",
            upd: "Tipo de usuario actualizado",
        },
        table: "Tipo_Usuario",
    },
}

const router = Router()
const repo = new CatalogRepository()
const root = `/:table(${Object.keys(catalogs).join("|")})`

function getData(req: Request) {
    const { filter, ids } = getBase(req)
    const item: CatalogBody = req.body
    const { id, table }: CatalogParams = req.params
    const catalog = catalogs[table]
    return {
        ids,
        item,
        filter,
        id: +id,
        msgs: catalog.msgs,
        table: catalog.table,
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
        const { filter, table } = getData(req)
        const items = repo.setTable(table).all(filter)
        res.json({ data: items })
    } catch (err: any) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por ID
router.get(
    `${root}/:id(\\d+)`,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, table } = getData(req)
            const item = repo.setTable(table).getByID(id)
            res.json({ data: item })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }
)

// Crear nuevo
router.post(
    root,
    validationMW(check),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { table, item, msgs } = getData(req)
            const created = repo.setTable(table).insert(item)
            res.status(201).send({
                message: msgs.add,
                data: created,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }
)

// Eliminar
router.delete(
    root,
    validationMW(GeneralVal.ids),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { table, ids, msgs } = getData(req)
            const items = repo.setTable(table).delete(ids)
            res.send({
                message: msgs.del,
                data: items,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }
)

// Actualizar nombre
router.patch(
    `${root}/:id(\\d+)`,
    validationMW(check),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { table, id, item, msgs } = getData(req)
            const updated = repo.setTable(table).update(id, item)
            res.json({
                message: updated ? msgs.upd : "No hubo modificaciones",
                data: updated,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.update(err))
            else next(err)
        }
    }
)

export default router
