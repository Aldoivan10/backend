import { Statement } from "better-sqlite3"
import { toBD } from "../util/util"
import Repository from "./repository"

export default class CatalogRepository extends Repository<
    CatalogBody,
    CatalogItem
> {
    protected mapper: Record<string, string> = {
        id: "id",
        name: "nombre",
    }
    private insertStm?: Statement<CatalogItem, CatalogItem>
    private updateStm?: Statement<CatalogItem, CatalogItem>

    constructor() {
        super("Catalogo")
    }

    setTable(table: string) {
        this.table = table
        this.init({ columns: Object.values(this.mapper) })
        this.insertStm = this.db.prepare<CatalogItem, CatalogItem>(
            `INSERT INTO ${table} VALUES (@id, @name) RETURNING *`
        )
        this.updateStm = this.db.prepare<CatalogItem, CatalogItem>(
            `UPDATE ${table} SET nombre=@name WHERE id=@id RETURNING *`
        )
        return this
    }

    insert(item: CatalogBody) {
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

    update(id: number, item: CatalogBody) {
        if (this.updateStm) {
            const catalog = toBD<CatalogItem>(
                { ...item, id },
                Object.keys(this.mapper)
            )
            return this.mapFunc(this.updateStm.get(catalog))
        }
        throw new Error("Method not implemented.")
    }
}
