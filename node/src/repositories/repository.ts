import { Database, Statement } from "better-sqlite3"
import db from "../model/betterdb"
import { mapTo } from "../util/util"

export default abstract class Repository<T> {
    protected db: Database = db
    protected table: string
    protected allStm!: Statement<Filters, Record<string, any>>
    protected getByIDStm!: Statement<ID, Record<string, any>>
    protected mapper?: Record<string, string>

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

    all = (filter: Filters) =>
        this.allStm.all(filter).map((item) => mapTo<T>(item, this.mapper))

    getByID = (id: number) => mapTo<T>(this.getByIDStm.get({ id }), this.mapper)

    abstract insert(item: T): T

    abstract update(id: number, item: T): T

    abstract delete(ids: number[]): T

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

    nextID() {
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
