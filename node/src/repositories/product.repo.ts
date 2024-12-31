import { Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"
import { Repository } from "./repository"

@injectable()
export default class ProductRepository extends Repository<Body.Product> {
    protected insertStm: Transaction<Repo.Insert<Body.Product>>
    protected updateStm: Transaction<Repo.Update<Body.Product>>
    protected logUpdateStm: Transaction<
        (id: number, input: Body.Product, user: string, changes: string) => Obj
    >

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(
            db,
            "id, id_departamento, departamento, id_proveedor, proveedor, codigos, unidades, nombre, cantidad, min, reembolsable",
            "Producto_Vista"
        )

        const insertProductStm = this.db.prepare<Body.Product>(
            "INSERT INTO Producto VALUES (null, @id_department, @id_supplier, @name, @amount, @buy, @min, @refundable)"
        )
        const updateProductStm = this.db.prepare<Body.Product & ID>(
            "UPDATE Producto SET nombre=@name,cantidad=@amount,min=@min,reembolsable=@refundable WHERE id=@id"
        )
        const insertCodeStm = this.db.prepare<Body.Code & { id_p: number }>(
            `INSERT INTO Producto_Codigo VALUES (@id_p, @id, @code)`
        )
        const insertUnitStm = this.db.prepare<Body.Unit & { id_p: number }>(
            `INSERT INTO Producto_Unidad VALUES (@id_p, @id, @profit, @sale)`
        )
        const delCodesStm = this.db.prepare<number>(
            "DELETE FROM Producto_Codigo WHERE id_producto=?"
        )
        const delUnitsStm = this.db.prepare<number>(
            "DELETE FROM Producto_Unidad WHERE id_producto=?"
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
        this.updateStm = this.db.transaction((id, item, _) => {
            delCodesStm.run(id)
            delUnitsStm.run(id)

            for (const code of item.codes)
                insertCodeStm.run({ id_p: id, ...code })
            for (const unit of item.units)
                insertUnitStm.run({ id_p: id, ...unit })

            const updated = updateProductStm.get({ id, ...item })
            return updated ? this.getByID(id) : null
        })
        this.logUpdateStm = this.db.transaction((id, item, user, changes) => {
            const result = this.logStm.run(user)
            const logID = Number(result.lastInsertRowid)
            this.changeStm.run(logID, "Modificó", changes)
            return this.updateStm(id, item, user)
        })
    }

    public updateAndLog(
        id: number,
        item: Body.Product,
        user: string,
        changes: string
    ) {
        return this.logUpdateStm(id, item, user, changes)
    }
}
