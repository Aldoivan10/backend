import { Transaction } from "better-sqlite3"
import { Repository } from "./repository"

export default class ProductRepository extends Repository<Body.Product> {
    protected insertStm: Transaction<Repo.Insert<Body.Product>>
    protected updateStm: Transaction<Repo.Update<Body.Product>>

    constructor() {
        super(
            "id, id_departamento, departamento, id_proveedor, proveedor, codigos, unidades, nombre, cantidad, min, reembolsable",
            "Producto_Vista"
        )

        const insertProductStm = this.db.prepare<Body.Product>(
            "INSERT INTO Producto VALUES (null, @id_department, @id_supplier, @name, @amount, @buy, @min, @refundable)"
        )
        const insertCodeStm = this.db.prepare<Body.Code & { id_p: number }>(
            `INSERT INTO Producto_Codigo VALUES (@id_p, @id, @code)`
        )
        const insertUnitStm = this.db.prepare<Body.Unit & { id_p: number }>(
            `INSERT INTO Producto_Unidad VALUES (@id_p, @id, @profit, @sale)`
        )

        this.insertStm = this.db.transaction((item, user) => {
            this.logStm.run(user)

            const result = insertProductStm.run(item)
            const id = Number(result.lastInsertRowid)
            for (const code of item.codes)
                insertCodeStm.run({ id_p: id, ...code })
            for (const unit of item.units)
                insertUnitStm.run({ id_p: id, ...unit })
            return this.getByID(id)
        })
        this.updateStm = this.db.transaction((id, item, user) => {})
    }
}
