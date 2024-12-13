import { Database, Statement, Transaction } from "better-sqlite3"
import db from "../model/db"
import { arrConj, getPlaceholders } from "../util/array.util"
import { mapTo, notFalsy, toJSON } from "../util/util"

export default abstract class Repository<
    I extends CatalogBody,
    O extends CatalogItem
> {
    protected db: Database = db
    protected table: string
    protected allStm!: Statement<Filters, Obj>
    protected getByIDStm!: Statement<ID, Maybe<Obj>>
    protected deleteStm!: Transaction<(args: DeleteArgs) => Array<Maybe<Obj>>>
    protected mapper?: Record<string, string>
    protected abstract insertStm: Statement<I, O> | Transaction<(input: I) => O>
    protected abstract updateStm:
        | Statement<I, O>
        | Transaction<(input: I, id: number) => O>
    protected mapFunc = (item: Maybe<Obj>) =>
        mapTo<O>(toJSON<Obj>(item), this.mapper)

    constructor(table: string) {
        this.table = table
    }

    protected init = ({
        columns,
        order = "nombre",
        filter = "nombre",
    }: RepoArgs) => {
        const deleteLogStm = this.db.prepare<CatalogItem, unknown>(
            "INSERT INTO Log VALUES (@id, @name)"
        )
        const deleteDescStm = this.db.prepare<ID & { desc: string }, unknown>(
            "INSERT INTO Log_Cambio VALUES (@id, @desc)"
        )

        this.allStm = this.db.prepare(this.allQuery(columns, order, filter))
        this.getByIDStm = this.db.prepare(this.getByIDQuery(columns))
        this.deleteStm = this.db.transaction(
            ({ ids, username, table = this.table }) => {
                const placeholders = getPlaceholders(ids)
                const stm = this.db.prepare<number[], Obj>(
                    `DELETE FROM ${this.table} WHERE id IN (${placeholders}) RETURNING *`
                )
                const items = stm
                    .all(...ids)
                    .map(this.mapFunc)
                    .filter(notFalsy)
                const logID = this.nextID("Log")!
                const names = items.map((item) => item.name)
                const desc = `<strong>${username} <span class="danger">eliminó</span></strong> (${table}): ${arrConj(
                    names
                )}`
                deleteLogStm.run({ id: logID, name: username })
                deleteDescStm.run({ id: logID, desc })
                return items
            }
        )
    }

    public all(filter: Filters) {
        return this.allStm.all(filter).map(this.mapFunc).filter(notFalsy)
    }

    public getByID(id: number) {
        return this.mapFunc(this.getByIDStm.get({ id }))
    }

    public delete(args: DeleteArgs) {
        return this.deleteStm(args)
    }

    abstract insert(item: I): O

    abstract update(id: number, item: I): Maybe<O>

    private allQuery(columns: string[], orderBy?: string, filterBy?: string) {
        const cols = columns.join()
        const filter = filterBy ? ` WHERE ${filterBy} LIKE @filter ` : ""
        const order = orderBy ? ` ORDER BY ${orderBy} ` : ""
        return `SELECT ${cols} FROM ${this.table}${filter}${order} LIMIT @limit OFFSET @offset`
    }

    private getByIDQuery(columns: string[]) {
        const cols = columns.join()
        return `SELECT ${cols} FROM ${this.table} WHERE id = @id`
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
