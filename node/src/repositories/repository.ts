import { Database, Statement } from "better-sqlite3"
import db from "../model/db"
import { getPlaceholders, mapTo } from "../util/util"

export default abstract class Repository<T> {
    protected db: Database = db
    protected table: string
    protected allStm!: Statement<Filters, Obj>
    protected getByIDStm!: Statement<ID, Obj>
    protected abstract mapper: Record<string, string>
    protected mapFunc = (item?: Obj) => mapTo<Maybe<T>>(item, this.mapper)

    constructor(table: string) {
        this.table = table
    }

    protected init = ({
        columns,
        order = "nombre",
        filter = "nombre",
    }: RepoArgs) => {
        this.allStm = this.db.prepare(this.allQuery(columns, order, filter))
        this.getByIDStm = this.db.prepare(this.getByIDQuery(columns))
    }

    all = (filter: Filters) => this.allStm.all(filter).map(this.mapFunc)

    getByID = (id: number) => mapTo<T>(this.getByIDStm.get({ id }), this.mapper)

    delete = (ids: number[]) => {
        const placeholders = getPlaceholders(ids)
        const stm = this.db.prepare<number[], Obj>(
            `DELETE FROM ${this.table} WHERE id IN (${placeholders}) RETURNING *`
        )
        return stm.all(...ids).map(this.mapFunc)
    }

    abstract insert(item: T): T

    abstract update(id: number, item: T): Maybe<T>

    protected allQuery(columns: string[], orderBy?: string, filterBy?: string) {
        const cols = columns.join()
        const filter = filterBy ? ` WHERE ${filterBy} LIKE @filter ` : ""
        const order = orderBy ? ` ORDER BY ${orderBy} ` : ""
        return `SELECT ${cols} FROM ${this.table}${filter}${order} LIMIT @limit OFFSET @offset`
    }

    protected getByIDQuery(columns: string[]) {
        const cols = columns.join()
        return `SELECT ${cols} FROM ${this.table} WHERE id = @id`
    }

    protected nextID() {
        const query = `
        WITH miss_id AS
        (
            SELECT id FROM ${this.table}
            UNION ALL 
            SELECT 0
        )
        SELECT MIN(id) + 1 AS id
        FROM miss_id
        WHERE NOT EXISTS
        (
            SELECT * FROM ${this.table} 
            WHERE ${this.table}.id = miss_id.id + 1
        )`
        return this.db.prepare<[], ID>(query).get()?.id
    }
}
