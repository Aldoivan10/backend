import { Statement, Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"
import { Repository } from "./repository"

@injectable()
export class BudgetRepository extends Repository<Body.Budget> {
    protected insertStm: Transaction<Repo.Insert<Body.Budget>>
    protected updateStm: Transaction<Repo.Update<Body.Budget>>
    protected getIdsBetween: Statement<Repo.Dates, ID>

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(
            db,
            ["id", "fecha", "usuario", "entidad", "productos"],
            "Presupuesto_Vista"
        )
        const insertLogStm = this.db.prepare<
            Body.Budget & { id_log: number },
            ID
        >(
            "INSERT INTO Log_Presupuesto VALUES (@id_log, null, @id_entity) RETURNING id_presupuesto AS id"
        )
        const insertProductStm = this.db.prepare<Body.BudgetItem>(
            "INSERT INTO Presupuesto VALUES (@id, @id_product, @id_unit, @amount)"
        )
        this.getIdsBetween = this.db.prepare(
            `SELECT id FROM ${this.table} WHERE fecha BETWEEN @init AND @end`
        )
        this.insertStm = this.db.transaction((input, usuario) => {
            const result = this.logStm.run(usuario)
            const logID = Number(result.lastInsertRowid)
            const budgetID = insertLogStm.get({ id_log: logID, ...input })
            const items = input.items.map((item) => ({ ...budgetID, ...item }))
            for (const item of items) insertProductStm.run(item)
            return this.getByID(budgetID!.id)
        })
        this.updateStm = this.db.transaction((_, __, ___) => {})
    }

    public update(_: number, __: Body.Budget, ___: string): Obj {
        throw new Error("Method not implemented")
    }

    public deleteBetween(dates: Repo.Dates, user: string, desc: string) {
        const ids = this.getIdsBetween.all(dates).map((item) => item.id)
        return super.delete(ids, user, desc)
    }
}
