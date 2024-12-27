import { SqliteError } from "better-sqlite3"
import { plainToClass } from "class-transformer"
import { NextFunction, Request, Response, Router } from "express"
import { FilterDomain } from "../domains/filter.domain"
import { FilterDto } from "../dtos/filter.dto"
import { requireAdminMW, tokenMW } from "../middlewares/token.mw"
import { validationMW } from "../middlewares/validation.mw"
import { DBError } from "../models/error"
import { CatalogService } from "../services/catalog.svc"
import { CatalogSchemas } from "../validations/catalog.val"
import { IdsSchema } from "../validations/general.val"

const catalogs: CatalogMap = {
    code: {
        del: "Códigos eliminados",
        add: "Código agregado",
        upd: "Código actaualizado",
    },
    unit: {
        del: "Unidades eliminadas",
        add: "Unidad agregada",
        upd: "Unidad actualizada",
    },
    entity_type: {
        add: "Tipo agregado",
        del: "Tipos eliminados",
        upd: "Tipo actualizado",
    },
    department: {
        add: "Departamento agregado",
        del: "Departamentos eliminados",
        upd: "Departamento actualizado",
    },
    user_type: {
        add: "Tipo de usuario agregado",
        del: "Tipos de usuario eliminados",
        upd: "Tipo de usuario actualizado",
    },
}

const router = Router()
const svc = new CatalogService()
const root = `/:table(${Object.keys(catalogs).join("|")})`
const columns = ["id", "nombre"]

function getFilter(req: Request) {
    const { table } = req.params
    const filterDTO = plainToClass(FilterDto, req.params, {
        excludeExtraneousValues: true,
    })
    const filter = new FilterDomain(columns, filterDTO).build()
    return { filter, table }
}

function getData(req: Request, res: Response) {
    const { id, table } = req.params
    const data = catalogs[table]
    const username = req.user!.name
    const body = req.body

    return {
        msgs: data,
        item: body,
        username,
        id: +id,
        table,
    }
}

function getSchema(req: Request) {
    const { table } = req.params
    return CatalogSchemas[table]
}

// Obtener todos
router.get(root, (req: Request, res: Response, next: NextFunction) => {
    try {
        const { filter, table } = getFilter(req)
        const items = svc.setTable(table).all(filter)
        res.json({ data: items })
    } catch (err: any) {
        if (err instanceof SqliteError) next(DBError.query(err))
        else next(err)
    }
})

// Obtener por ID
router.get(
    `${root}/:id(\\d+)`,
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, table } = getData(req, res)
            const item = svc.setTable(table).getByID(+id)
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
    tokenMW,
    requireAdminMW,
    validationMW(getSchema),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { table, msgs, item, username } = getData(req, res)
            const created = svc.setTable(table).add(item, username)
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

// Actualizar nombre
router.patch(
    `${root}/:id(\\d+)`,
    tokenMW,
    requireAdminMW,
    validationMW(IdsSchema),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { table, item, msgs, username, id } = getData(req, res)
            const updated = svc.setTable(table).edit(id, item, username)
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

// Eliminar
router.delete(
    root,
    tokenMW,
    requireAdminMW,
    validationMW(IdsSchema),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { table, msgs, item, username } = getData(req, res)
            const items = svc.setTable(table).remove(item.ids, username)
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

export default router
