import { SqliteError } from "better-sqlite3"
import { NextFunction, Request, Response } from "express"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { CatalogDTO } from "../dtos/catalog.dto"
import { DBError } from "../models/error"
import { CatalogService } from "../services/catalog.svc"
import { CatalogType } from "../validations/catalog.val"
import { Controller } from "./controller"

@injectable()
export class CatalogController extends Controller<
    CatalogType,
    Body.Catalog,
    CatalogDTO
> {
    protected readonly catalogs: CatalogMap = {
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

    constructor(
        @inject(Types.CatalogService) protected readonly svc: CatalogService
    ) {
        super(["id", "nombre"])
    }

    public getRoute() {
        return `/:table(${Object.keys(this.catalogs).join("|")})`
    }

    public findAll(req: Request, res: Response, next: NextFunction): void {
        try {
            const filter = this.getFilter(req, this.columns)
            const table = req.params.table
            const items = this.svc.setTable(table).all(filter)
            res.json({ data: items })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }

    public find(req: Request, res: Response, next: NextFunction): void {
        try {
            const filter = this.getFilter(req, this.columns)
            const table = req.params.table
            const item = this.svc.setTable(table).get(filter)
            res.json({ data: item })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }

    public findByID(req: Request, res: Response, next: NextFunction): void {
        try {
            const { id, table } = this.getData(req)
            const item = this.svc.setTable(table).getByID(+id)
            res.json({ data: item })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.query(err))
            else next(err)
        }
    }

    public create(req: Request, res: Response, next: NextFunction): void {
        try {
            const { table, msgs, item, username } = this.getData(req)
            const created = this.svc.setTable(table).add(item, username)
            res.status(201).send({
                message: msgs.add,
                data: created,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.insert(err))
            else next(err)
        }
    }

    public update(req: Request, res: Response, next: NextFunction): void {
        try {
            const { table, item, msgs, username, id } = this.getData(req)
            const updated = this.svc.setTable(table).edit(id, item, username)
            res.json({
                message: updated ? msgs.upd : "No hubo modificaciones",
                data: updated,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.update(err))
            else next(err)
        }
    }

    public delete(req: Request, res: Response, next: NextFunction): void {
        try {
            const { table, msgs, item, username } = this.getData(req)
            const items = this.svc.setTable(table).remove(item.ids, username)
            res.send({
                message: msgs.del,
                data: items,
            })
        } catch (err: any) {
            if (err instanceof SqliteError) next(DBError.delete(err))
            else next(err)
        }
    }

    protected getData(req: Request) {
        const { id, table } = req.params
        const data = this.catalogs[table]
        const username = req.user?.name || "Desconocido"
        const body = req.body

        return {
            msgs: data,
            item: body,
            username,
            id: +id,
            table,
        }
    }
}
