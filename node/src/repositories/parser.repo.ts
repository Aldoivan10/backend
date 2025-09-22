import type { Database, Transaction } from "better-sqlite3"
import { inject, injectable } from "inversify"
import { Types } from "../containers/types"
import { Repository } from "./repository"

@injectable()
export class ParserRepository extends Repository<Body.Parser> {
    protected insertStm: Transaction<Repo.Insert<Body.Parser>>
    protected updateStm: Transaction<Repo.Update<Body.Parser>>

    constructor(@inject(Types.DataBase) protected readonly db: Database) {
        super(
            db,
            [
                "id",
                "id_unidad",
                "unidad",
                "id_sub_unidad",
                "sub_unidad",
                "multiplicador",
            ],
            "Conversion_Vista"
        )
        const insertStm = this.db.prepare<Body.Parser>(
            "INSERT INTO Conversion VALUES (null, @id_unit, @id_sub_unit, @multiplier)"
        )
        const updateStm = this.db.prepare<Body.Parser & ID>(
            "UPDATE Conversion SET id_unidad=@id_unit, id_sub_unidad=@id_sub_unit, multiplicador=@multiplier WHERE id=@id"
        )
        this.insertStm = this.db.transaction((body, _) => {
            const result = insertStm.run(body)
            const id = Number(result.lastInsertRowid)
            return this.getByID(id)
        })
        this.updateStm = this.db.transaction((id, body, _) => {
            updateStm.run({ id, ...body })
            return this.getByID(id)
        })
    }
}
