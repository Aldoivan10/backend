import { Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"
import { arrConj, getPlaceholders } from "../utils/array.util"
import { Repository } from "./repository"

@injectable()
export class CatalogRepository extends Repository<Body.Catalog> {
    protected insertStm!: Transaction<Repo.Insert<Body.Catalog>>
    protected updateStm!: Transaction<Repo.Update<Body.Catalog>>

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(db, ["id", "nombre"])
    }

    public setTable(table: string) {
        if (this.table === table) return this
        const insertItemStm = this.db.prepare<Body.Catalog, Obj>(
            `INSERT INTO ${table}(nombre) VALUES (@name) RETURNING *`
        )
        const updateItemStm = this.db.prepare<Body.Catalog & ID, Obj>(
            `UPDATE ${table} SET nombre=@name WHERE id=@id RETURNING *`
        )
        this.insertStm = this.db.transaction((item, user) => {
            this.logStm.run(user)
            return insertItemStm.get(item)
        })

        this.updateStm = this.db.transaction((id, item, user) => {
            this.logStm.run(user)
            return updateItemStm.get({ id, ...item })
        })

        this.getByIDStm = this.db.prepare(
            `SELECT ${this.columns} FROM ${table} WHERE id = ?`
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
            const names = deleteds.map((item) => item.nombre)
            this.changeStm.run(logID, "Eliminó", `${desc}: ${arrConj(names)}`)

            return deleteds
        })

        this.table = table

        return this
    }

    public insert(item: Body.Catalog, user: string) {
        if (this.insertStm) return this.insertStm(item, user)
        throw new Error("Method not implemented.")
    }

    public update(id: number, item: Body.Catalog, user: string) {
        if (this.updateStm) return this.updateStm(id, item, user)
        throw new Error("Method not implemented.")
    }

    public delete(ids: number[], user: string, desc: string) {
        return super.delete(ids, user, desc)
    }
}
