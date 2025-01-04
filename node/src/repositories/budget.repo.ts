import { Transaction } from "better-sqlite3"
import { Repository } from "./repository"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"

@injectable()
export class BudgetRepository extends Repository<Body.Budget> {
    protected insertStm: Transaction<Repo.Insert<Body.Budget>>
    protected updateStm: Transaction<Repo.Update<Body.Budget>>

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(db, "id, fecha, usuario, entidad, productos", "Presupuesto_Vista")
        const insertLogStm = this.db.prepare<
            Body.Budget & { id_log: number },
            ID
        >(
            "INSERT INTO Log_Presupuesto VALUES (@id_log, null, @id_entity) RETURNING id_presupuesto AS id"
        )
        const insertProductStm = this.db.prepare<Body.BudgetItem>(
            "INSERT INTO Presupuesto VALUES (@id, @id_product, @id_unit, @amount)"
        )
        this.insertStm = this.db.transaction((input, usuario) => {
            const result = this.logStm.run(usuario)
            const logID = Number(result.lastInsertRowid)
            const budgetID = insertLogStm.get({ id_log: logID, ...input })
            const items = input.items.map((item) => ({ ...budgetID, ...item }))
            for (const item of items) insertProductStm.run(item)
            return this.getByID(logID)
        })
        this.updateStm = this.db.transaction((_, __, ___) => {
            return {}
        })
    }
}
