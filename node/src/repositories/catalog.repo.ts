import { Transaction } from "better-sqlite3"
import { getPlaceholders } from "../utils/array.util"
import { Repository } from "./repository"

export class CatalogRepository extends Repository<Body.Catalog> {
    protected insertStm!: Transaction<Repo.Insert<Body.Catalog>>
    protected updateStm!: Transaction<Repo.Update<Body.Catalog>>

    constructor() {
        super("id, nombre")
    }

    public setTable(table: string) {
        if (this.table === table) return this
        const insertItemStm = this.db.prepare<Body.Catalog & ID, Obj>(
            `INSERT INTO ${table} VALUES (@id, @name) RETURNING *`
        )
        const updateItemStm = this.db.prepare<Body.Catalog & ID, Obj>(
            `UPDATE ${table} SET nombre=@name WHERE id=@id RETURNING *`
        )
        this.insertStm = this.db.transaction((item, log) => {
            const id = this.nextID()!
            const created = insertItemStm.get({ id, ...item })
            if (log && created) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return created
        })

        this.updateStm = this.db.transaction((id, item, log) => {
            const updated = updateItemStm.get({ id, ...item })
            if (log && updated) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return updated
        })

        this.getByIDStm = this.db.prepare(
            `SELECT ${this.columns} FROM ${table} WHERE id = ?`
        )

        this.deleteStm = this.db.transaction((ids, log) => {
            const placeholders = getPlaceholders(ids)
            const stm = this.db.prepare<number[], Obj>(
                `DELETE FROM ${table} WHERE id IN (${placeholders}) RETURNING *`
            )
            const deleteds = stm.all(...ids)
            if (log && deleteds.length) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return deleteds
        })

        this.table = table

        return this
    }

    public insert(item: Body.Catalog, log: Repo.Log) {
        if (this.insertStm) return this.insertStm(item, log)
        throw new Error("Method not implemented.")
    }

    public update(id: number, item: Body.Catalog, log: Repo.Log) {
        if (this.updateStm) return this.updateStm(id, item, log)
        throw new Error("Method not implemented.")
    }

    public delete(ids: number[], log: Repo.Log) {
        return super.delete(ids, log)
    }
}
