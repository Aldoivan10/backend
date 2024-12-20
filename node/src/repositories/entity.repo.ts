import { Transaction } from "better-sqlite3"
import { Repository } from "./repository"

export default class EntityRepository extends Repository<Body.Entity> {
    protected insertStm: Transaction<Repo.Insert<Body.Entity>>
    protected updateStm: Transaction<Repo.Update<Body.Entity>>

    constructor() {
        super(
            "id, nombre, tipo, rfc, dirección, domicilio, codigo_postal, telefono,correo",
            "Entidad_Vista"
        )
        const insertItemStm = this.db.prepare<Body.Entity & ID, Obj>(
            `INSERT INTO Entidad VALUES (@id, @id_entity_type, @rfc, @name, @address, @domicile, @postal_code, @phone, @email) RETURNING *`
        )
        const updateItemStm = this.db.prepare<Body.Entity & ID, Obj>(
            `UPDATE Entidad SET nombre=@name, id_tipo_entidad=@id_entity_type, rfc=@rfc, dirección=@address, domicilio=@domicile, codigo_postal=@postal_code, telefono=@phone,correo=@email WHERE id=@id RETURNING *`
        )
        this.insertStm = this.db.transaction((item, log) => {
            const id = this.nextID()!
            const created = insertItemStm.get({ id, ...item })
            if (log && created) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return created
        })

        this.updateStm = this.db.transaction((id, item, log) => {
            const updated = updateItemStm.get({ id, ...item })
            if (log && updated) {
                const logID = this.addLog(log.user)
                this.changeStm.run(logID, log.desc)
            }
            return updated
        })
    }
}
