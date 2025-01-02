import { Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"
import { Repository } from "./repository"

@injectable()
export class KitRepository extends Repository<Body.Kit> {
    protected insertStm: Transaction<Repo.Insert<Body.Kit>>
    protected updateStm: Transaction<Repo.Update<Body.Kit>>
    protected logUpdateStm: Transaction<
        (id: number, input: Body.Kit, user: string, changes: string) => Obj
    >

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(db, "id, nombre, productos", "Kit_Vista")
        const insertStm = this.db.prepare<Body.Kit>(
            "INSERT INTO Kit VALUES (null, @name)"
        )
        const insertProductStm = this.db.prepare<
            Body.KitProduct & { id_k: number }
        >("INSERT INTO Producto_Kit VALUES (@id_k, @id, @unit, @amount)")
        const updateStm = this.db.prepare<Body.Kit & ID>(
            "UPDATE Kit SET nombre=@name WHERE id=@id"
        )
        const delProductsStm = this.db.prepare(
            "DELETE FROM Producto_Kit WHERE id_kit=?"
        )

        this.insertStm = this.db.transaction((kit, user) => {
            this.logStm.run(user)
            const result = insertStm.run(kit)
            const kitID = Number(result.lastInsertRowid)
            for (const product of kit.products)
                insertProductStm.run({
                    id_k: kitID,
                    ...product,
                })

            return this.getByID(kitID)
        })
        this.updateStm = this.db.transaction((id, kit, _) => {
            delProductsStm.run(id)
            updateStm.run({ id, ...kit })
            for (const product of kit.products)
                insertProductStm.run({
                    id_k: id,
                    ...product,
                })
            return this.getByID(id)
        })
        this.logUpdateStm = this.db.transaction((id, input, user, changes) => {
            const result = this.logStm.run(user)
            const logID = Number(result.lastInsertRowid)
            this.changeStm.run(logID, "Modificó", changes)
            return this.updateStm(id, input, user)
        })
    }

    public updateAndLog(
        id: number,
        item: Body.Kit,
        user: string,
        changes: string
    ) {
        return this.logUpdateStm(id, item, user, changes)
    }
}
