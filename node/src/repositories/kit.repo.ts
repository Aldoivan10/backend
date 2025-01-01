import { Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { APIDataBase } from "../models/db"
import { Repository } from "./repository"

@injectable()
export class KitRepository extends Repository<Body.Kit> {
    protected insertStm: Transaction<Repo.Insert<Body.Kit>>
    protected updateStm: Transaction<Repo.Update<Body.Kit>>

    constructor(@inject(Types.DataBase) protected readonly db: APIDataBase) {
        super(db, "id, nombre, productos", "Kit_Vista")
        const insertStm = this.db.prepare<Body.Kit>(
            "INSERT INTO Kit VALUES (null, @name)"
        )
        const insertProductStm = this.db.prepare<
            Body.KitProduct & { id_k: number }
        >("INSERT INTO Producto_Kit VALUES (@id_k, @id, @unit, @amount)")
        const updateStm = this.db.prepare<Body.Kit & ID>("SELECT * FROM Kit")

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
        this.updateStm = this.db.transaction((id, kit, user) => {})
    }
}
