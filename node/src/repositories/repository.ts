import { Database, Statement, Transaction } from "better-sqlite3"
import db from "../model/db"
import { arrConj, getPlaceholders } from "../util/array.util"
import { mapTo, notFalsy, toJSON } from "../util/obj.util"

export default abstract class Repository<
    I extends Object,
    O extends CatalogBody
> {
    protected db: Database = db
    protected table: string
    protected allStm!: Statement<Filters, Obj>
    protected getByIDStm!: Statement<ID, Maybe<Obj>>
    protected deleteStm!: Transaction<(args: DeleteArgs) => Array<Maybe<O>>>
    protected logStm!: Statement<CatalogItem, unknown>
    protected changeStm!: Statement<ID & { desc: string }, unknown>

    protected mapper?: Record<string, string>
    protected abstract insertStm:
        | Statement<I, Obj>
        | Transaction<(input: I) => O>
    protected abstract updateStm:
        | Statement<I, Obj>
        | Transaction<(input: I, id: number) => O>

    protected mapFunc = (item: Maybe<Obj>) =>
        mapTo<O>(toJSON<Obj>(item), this.mapper)
    protected mapArr = (items: Maybe<Obj>[]) =>
        items.map(this.mapFunc).filter(notFalsy)

    constructor(table: string) {
        this.table = table
    }

    protected init = ({
        columns,
        order = "nombre",
        filter = "nombre",
    }: RepoArgs) => {
        this.logStm = this.db.prepare(
            "INSERT INTO Log (id, usuario) VALUES (@id, @name)"
        )
        this.changeStm = this.db.prepare(
            "INSERT INTO Log_Cambio VALUES (@id, @desc)"
        )
        this.allStm = this.db.prepare(this.allQuery(columns, order, filter))
        this.getByIDStm = this.db.prepare(this.getByIDQuery(columns))
        this.deleteStm = this.db.transaction(
            ({ ids, username = "Desconocido", target }) => {
                const placeholders = getPlaceholders(ids)
                const logID = this.addLog(username)
                const stm = this.db.prepare<number[], Obj>(
                    `DELETE FROM ${this.table} WHERE id IN (${placeholders}) RETURNING *`
                )
                const items = this.mapArr(stm.all(...ids))
                this.changeStm.run({
                    id: logID,
                    desc: this.getChange({
                        target,
                        type: "del",
                        user: username,
                        items: items.map((item) => item.name),
                    }),
                })
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

    protected addLog(user: string) {
        const logID = this.nextID("Log")!
        this.logStm.run({ id: logID, name: user })
        return logID
    }

    protected getChange({ type, user, target, items }: ChangeArgs) {
        const change = target ? ` ${target}: ` : ":"
        const strArr = arrConj(items)
        switch (type) {
            case "add":
                return `<strong><span class="text-primary">${user}</span> <span class="text-success">creó</span>${change}</strong>${strArr}`
            case "upd":
                return `<strong><span class="text-primary">${user}</span> <span class="text-warning">modificó</span>${change}</strong>${strArr}`
            case "del":
                return `<strong><span class="text-primary">${user}</span> <span class="text-error">eliminó</span>${change}</strong>${strArr}`
            default:
                throw new Error("Invalid change type")
        }
    }
}
