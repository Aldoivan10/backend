import { Statement, Transaction } from "better-sqlite3"
import { arrConj, getPlaceholders } from "../utils/array.util"
import { DBRepo } from "./db.repo"

export abstract class Repository<I extends Record<string, any>> extends DBRepo {
    protected changeStm!: Statement<Repo.Change, unknown>
    protected getByIDStm!: Statement<number, Maybe<Obj>>
    protected deleteStm!: Transaction<Repo.Delete>
    protected logStm!: Statement<string, unknown>

    protected abstract insertStm: Transaction<Repo.Insert<I>>
    protected abstract updateStm: Transaction<Repo.Update<I>>

    constructor(protected readonly columns: string, protected table?: string) {
        super()
        this.logStm = this.db.prepare("INSERT INTO Log (usuario) VALUES (?)")
        this.changeStm = this.db.prepare(
            "INSERT INTO Log_Cambio VALUES (?, ?, ?)"
        )

        if (table) {
            this.getByIDStm = this.db.prepare(
                `SELECT ${columns} FROM ${table} WHERE id = ?`
            )
            this.deleteStm = this.db.transaction((ids, user, desc) => {
                const placeholders = getPlaceholders(ids)
                const stm = this.db.prepare<number[], Obj>(
                    `DELETE FROM ${table} WHERE id IN (${placeholders}) RETURNING *`
                )
                const result = this.logStm.run(user)
                const deleteds = stm.all(...ids)

                if (!deleteds.length) return []

                const logID = Number(result.lastInsertRowid)
                const names = deleteds.map((item) => item.nombre)
                this.changeStm.run(
                    logID,
                    "Eliminó",
                    `${desc}: ${arrConj(names)}`
                )

                return stm.all(...ids)
            })
        }
    }

    public all(data: FilterData, filter: string = "") {
        const query =
            `SELECT ${this.columns} FROM ${this.table} ${filter}`.trim()
        const stm = this.db.prepare<FilterData, Obj>(query)
        return stm.all(data)
    }

    public getByID(id: number) {
        return this.getByIDStm.get(id)
    }

    public insert(item: I, user: string) {
        return this.insertStm(item, user).get()
    }

    public update(id: number, item: I, user: string) {
        return this.updateStm(id, item, user).get()
    }

    public delete(ids: number[], user: string, desc: string) {
        return this.deleteStm(ids, user, desc)
    }
}
