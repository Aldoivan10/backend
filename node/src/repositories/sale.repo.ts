import { Statement, Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"
import { Repository } from "./repository"

@injectable()
export class SaleRepository extends Repository<Body.Sale> {
    protected insertStm: Transaction<Repo.Insert<Body.Sale>>
    protected updateStm: Transaction<Repo.Update<Body.Sale>>
    protected getIdsBetween: Statement<Repo.Dates, ID>

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(
            db,
            [
                "id",
                "usuario",
                "fecha",
                "entidad",
                "total",
                "descuento",
                "nuevo_total",
                "productos",
            ],
            "Venta_Vista"
        )
        const insertStm = this.db.prepare<Body.Sale & { id_log: number }>(
            "INSERT INTO Log_Venta VALUES (null, @id_log, @entity, @total, @discount, @new_total)"
        )
        const insertProductSt = this.db.prepare<Body.ProductSale & ID>(
            "INSERT INTO Venta VALUES (@id, @product, @unit, @amount, @sale, @new_sale)"
        )
        this.getIdsBetween = this.db.prepare(
            `SELECT id FROM ${this.table} WHERE fecha BETWEEN @init AND @end`
        )
        this.insertStm = this.db.transaction((body, user) => {
            const logResult = this.logStm.run(user)
            const logID = Number(logResult.lastInsertRowid)
            const result = insertStm.run({ id_log: logID, ...body })
            const saleID = Number(result.lastInsertRowid)
            for (const item of body.items)
                insertProductSt.run({ id: saleID, ...item })
            return this.getByID(saleID)
        })
        this.updateStm = this.db.transaction((_, __, ___) => {})
    }

    public update(_: number, __: Body.Sale, ___: string): Obj {
        throw new Error("Method not implemented")
    }

    public deleteBetween(dates: Repo.Dates, user: string, desc: string) {
        const ids = this.getIdsBetween.all(dates).map((item) => item.id)
        return super.delete(ids, user, desc)
    }
}
