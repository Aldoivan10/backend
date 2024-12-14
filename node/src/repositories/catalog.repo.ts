import { Statement } from "better-sqlite3"
import { toBD } from "../util/obj.util"
import Repository from "./repository"

export default class CatalogRepository extends Repository<
    CatalogBody,
    CatalogItem
> {
    protected mapper: Record<string, string> = {
        id: "id",
        name: "nombre",
    }
    protected insertStm!: Statement<CatalogBody, Obj>
    protected updateStm!: Statement<CatalogBody, Obj>

    constructor() {
        super("Catalogo")
    }

    public setTable(table: string) {
        this.table = table
        this.init({ columns: Object.values(this.mapper) })
        this.insertStm = this.db.prepare(
            `INSERT INTO ${table} VALUES (@id, @name) RETURNING *`
        )
        this.updateStm = this.db.prepare(
            `UPDATE ${table} SET nombre=@name WHERE id=@id RETURNING *`
        )
        return this
    }

    public insert(item: CatalogBody) {
        if (this.insertStm) {
            const id = this.nextID()!
            const catalog = toBD<CatalogItem>(
                { ...item, id },
                Object.keys(this.mapper)
            )
            return this.mapFunc(this.insertStm.get(catalog))!
        }
        throw new Error("Method not implemented.")
    }

    public update(id: number, item: CatalogBody) {
        if (this.updateStm) {
            const catalog = toBD<CatalogItem>(
                { ...item, id },
                Object.keys(this.mapper)
            )
            return this.mapFunc(this.updateStm.get(catalog))
        }
        throw new Error("Method not implemented.")
    }

    public delete(args: Omit<DeleteArgs, "target">) {
        const msgs: Record<string, string> = {
            code: "los códigos",
            unit: "las unidades",
            entity_type: "los tipos de entidad",
            department: "los departamentos",
            user_type: "los tipos de usuario",
        }
        return super.delete({ ...args, target: msgs[this.table] })
    }
}
