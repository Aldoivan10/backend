import { Statement, Transaction } from "better-sqlite3"
import { APIDataBase } from "../models/db"
import { getPlaceholders } from "../utils/array.util"

export interface IRepo<I extends Obj> {
    all(data: FilterData, filter: string): Obj[]

    getByID(id: number): Maybe<Obj>

    getByFilter(data: FilterData, filter: string): Maybe<Obj>

    insert(item: I, user: string): Obj

    update(id: number, item: I, user: string): Obj

    delete(ids: number[], user: string, desc: string): Obj[]

    total(data: FilterData, filter: string): Obj
}

export abstract class Repository<I extends Obj> implements IRepo<I> {
    protected changeStm!: Statement<Repo.Change, unknown>
    protected getByIDStm!: Statement<number, Maybe<Obj>>
    protected deleteStm!: Transaction<Repo.Delete>
    protected logStm!: Statement<string, unknown>

    protected abstract insertStm: Transaction<Repo.Insert<I>>
    protected abstract updateStm: Transaction<Repo.Update<I>>

    constructor(
        protected readonly db: APIDataBase,
        protected readonly columns: string[],
        protected table?: string
    ) {
        this.logStm = this.db.prepare("INSERT INTO Log (usuario) VALUES (?)")
        this.changeStm = this.db.prepare(
            "INSERT INTO Log_Cambio VALUES (?, ?, ?)"
        )

        if (table) {
            this.getByIDStm = this.db.prepare(
                `SELECT ${columns.join()} FROM ${table} WHERE id = ?`
            )
            this.deleteStm = this.db.transaction((ids, user, desc) => {
                const placeholders = getPlaceholders(ids)
                const stm = this.db.prepare<number[], Obj>(
                    `DELETE FROM ${table} WHERE id IN (${placeholders}) RETURNING *`
                )
                const deleteds = stm.all(...ids)

                if (!deleteds.length) return []

                const result = this.logStm.run(user)
                const logID = Number(result.lastInsertRowid)

                this.changeStm.run(logID, "Eliminó", desc)

                return deleteds
            })
        }
    }

    public total(data: FilterData, filter: string): Obj {
        const query =
            `SELECT COUNT(1) total FROM ${this.table} ${filter}`.trim()
        const stm = this.db.prepare<FilterData, Obj>(query)
        return stm.get(data)!;
    }

    public all(data: FilterData, filter: string = "") {
        const query =
            `SELECT ${this.columns} FROM ${this.table} ${filter}`.trim()
        const stm = this.db.prepare<FilterData, Obj>(query)
        return stm.all(data)
    }

    public getByFilter(data: FilterData, filter: string) {
        const query =
            `SELECT ${this.columns} FROM ${this.table} ${filter}`.trim()
        const stm = this.db.prepare<FilterData, Obj>(query)
        return stm.get(data)
    }

    public getByID(id: number) {
        return this.getByIDStm.get(id)
    }

    public insert(item: I, user: string) {
        return this.insertStm(item, user)
    }

    public update(id: number, item: I, user: string) {
        return this.updateStm(id, item, user)
    }

    public delete(ids: number[], user: string, desc: string) {
        return this.deleteStm(ids, user, desc)
    }
}
