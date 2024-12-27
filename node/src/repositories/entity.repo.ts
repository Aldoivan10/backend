import { Transaction } from "better-sqlite3"
import { Repository } from "./repository"

export default class EntityRepository extends Repository<Body.Entity> {
    protected insertStm: Transaction<Repo.Insert<Body.Entity>>
    protected updateStm: Transaction<Repo.Update<Body.Entity>>

    constructor() {
        super(
            "id, nombre, id_tipo, tipo, rfc, direccion, domicilio, codigo_postal, telefono,correo",
            "Entidad_Vista"
        )
        const insertStm = this.db.prepare<Body.Entity>(
            `INSERT INTO Entidad VALUES (null, @id_entity_type, @rfc, @name, @address, @domicile, @postal_code, @phone, @email)`
        )
        const updateStm = this.db.prepare<Body.Entity & ID, ID>(
            `UPDATE Entidad SET nombre=@name, id_tipo_entidad=@id_entity_type, rfc=@rfc, direccion=@address, domicilio=@domicile, codigo_postal=@postal_code, telefono=@phone,correo=@email WHERE id=@id RETURNING id`
        )
        this.insertStm = this.db.transaction((item, user) => {
            this.logStm.run(user)

            const result = insertStm.run(item)
            const id = Number(result.lastInsertRowid)
            return this.getByID(id)
        })

        this.updateStm = this.db.transaction((id, item, user) => {
            this.logStm.run(user)
            const updated = updateStm.get({ id, ...item })
            return updated ? this.getByID(id) : null
        })
    }
}
