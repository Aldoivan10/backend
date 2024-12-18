import { Database, Statement, Transaction } from "better-sqlite3"
import { getPlaceholders } from "../utils/array.util"

export default abstract class Repository<I extends Record<string, any>> {
    protected getByIDStm!: Statement<number, Maybe<Obj>>
    protected deleteStm!: Transaction<Repo.Delete>
    protected logStm!: Statement<Repo.Change, unknown>
    protected changeStm!: Statement<Repo.Change, unknown>

    protected abstract insertStm: Transaction<Repo.Insert<I>>
    protected abstract updateStm: Transaction<Repo.Update<I>>

    constructor(
        protected table: string,
        protected readonly columns: string,
        protected readonly db: Database = db
    ) {
        this.logStm = db.prepare("INSERT INTO Log (id, usuario) VALUES (?, ?)")
        this.changeStm = db.prepare("INSERT INTO Log_Cambio VALUES (?, ?)")
        this.getByIDStm = this.db.prepare(
            `SELECT ${columns} FROM ${table} WHERE id = ?`
        )
        this.deleteStm = this.db.transaction((ids, log) => {
            const placeholders = getPlaceholders(ids)
            const stm = this.db.prepare<number[], Obj>(
                `DELETE FROM ${this.table} WHERE id IN (${placeholders}) RETURNING *`
            )
            if (log) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return stm.all(...ids)
        })
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

    abstract insert(item: I, log: Repo.Log): Obj

    abstract update(id: number, item: I, log: Repo.Log): Maybe<Obj>

    public delete(ids: number[], log?: Repo.Log) {
        return this.deleteStm(ids, log)
    }

    protected addLog(user: string) {
        const logID = this.nextID("Log")!
        this.logStm.run(logID, user)
        return logID
    }

    protected nextID(table?: string) {
        const query = `
        WITH miss_id AS
        (
            SELECT id FROM ${table ?? this.table}
            UNION ALL 
            SELECT 0
        )
        SELECT MIN(id) + 1 AS id
        FROM miss_id
        WHERE NOT EXISTS
        (
            SELECT * FROM ${table ?? this.table} 
            WHERE ${table ?? this.table}.id = miss_id.id + 1
        )`
        return this.db.prepare<[], ID>(query).get()?.id
    }
}
