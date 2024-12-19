import { Transaction } from "better-sqlite3"
import { getPlaceholders } from "../utils/array.util"
import { Repository } from "./repository"

export class CatalogRepository extends Repository<CatalogBody> {
    protected insertStm!: Transaction<Repo.Insert<CatalogBody>>
    protected updateStm!: Transaction<Repo.Update<CatalogBody>>

    constructor() {
        super("id, nombre")
    }

    public setTable(table: string) {
        if (this.table === table) return this
        const insertItemStm = this.db.prepare<CatalogBody & ID, Obj>(
            `INSERT INTO ${table} VALUES (@id, @name) RETURNING *`
        )
        const updateItemStm = this.db.prepare<CatalogBody & ID, Obj>(
            `UPDATE ${table} SET nombre=@name WHERE id=@id RETURNING *`
        )
        this.insertStm = this.db.transaction((item, log) => {
            const id = this.nextID()!
            if (log) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return insertItemStm.get({ id, ...item })
        })

        this.updateStm = this.db.transaction((id, item, log) => {
            if (log) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return updateItemStm.get({ id, ...item })
        })

        this.deleteStm = this.db.transaction((ids, log) => {
            const placeholders = getPlaceholders(ids)
            const stm = this.db.prepare<number[], Obj>(
                `DELETE FROM ${table} WHERE id IN (${placeholders}) RETURNING *`
            )
            if (log) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return stm.all(...ids)
        })

        this.table = table

        return this
    }

    public insert(item: CatalogBody, log: Repo.Log) {
        if (this.insertStm) return this.insertStm(item, log)
        throw new Error("Method not implemented.")
    }

    public update(id: number, item: CatalogBody, log: Repo.Log) {
        if (this.updateStm) return this.updateStm(id, item, log)
        throw new Error("Method not implemented.")
    }

    public delete(ids: number[], log: Repo.Log) {
        return super.delete(ids, log)
    }
}
