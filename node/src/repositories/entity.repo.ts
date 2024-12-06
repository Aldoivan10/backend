import { Statement } from "better-sqlite3"
import { toBD } from "../util/util"
import Repository from "./repository"

export default class EntityRepository extends Repository<Entity> {
    protected mapper: Record<string, string> = {
        id: "id",
        name: "nombre",
        id_entity_type: "id_tipo_entidad",
        rfc: "rfc",
        address: "direccion",
        domicile: "domicilio",
        postal_code: "codigo_postal",
        phone: "telefono",
        email: "correo",
    }
    private insertStm: Statement<Entity, Obj>
    private updateStm: Statement<Entity, Obj>

    constructor() {
        super("Entidad")
        this.init({ columns: Object.values(this.mapper) })
        this.insertStm = this.db.prepare<Entity, Entity>(
            `INSERT INTO ${this.table} VALUES (@id, @id_entity_type, @rfc, @name, @address, @domicile, @postal_code, @phone, @email) RETURNING *`
        )
        this.updateStm = this.db.prepare<Entity, Entity>(
            `UPDATE ${this.table} SET id_tipo_entidad=@id_entity_type, rfc=@rfc, nombre=@name, direccion=@address, domicilio=@domicile, codigo_postal=@postal_code, telefono=@phone, correo=@email WHERE id=@id RETURNING *`
        )
    }

    insert(item: EntityBody): Entity {
        const id = this.nextID()!
        const entity = toBD<Entity>({ ...item, id }, Object.keys(this.mapper))
        return this.mapFunc(this.insertStm.get(entity))!
    }

    update(id: number, item: EntityBody): Maybe<Entity> {
        const entity = toBD<Entity>({ ...item, id }, Object.keys(this.mapper))
        return this.mapFunc(this.updateStm.get(entity))
    }
}
